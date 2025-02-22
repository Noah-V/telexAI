import express, { Request, Response } from "express";
import { integrationConfig } from "../config/telexIntegrationConfig";
import { defaultConfig } from "../config/defaultConfig";
import { Message, ModifierIntegrationPayload } from "../types/types";
import { AI } from "../services/ai";
import dotenv from "dotenv";

function generateUniqueId(): string {
	return Math.random().toString(36).substr(2, 9);
}
import cors from "cors";
import { MessageStorage } from "../services/storage";
import { TelexService } from "../services/telexService";

dotenv.config();

const storage = new MessageStorage();
const app = express();
const port = 3000;
const ai = new AI(process.env.GEMINI_API_KEY, storage);
const telexService = new TelexService();

app.use(express.json());

app.use(
	cors({
		origin: "*",
		maxAge: 600,
	})
);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

app.post("/webhook", async (req: Request, res: Response): Promise<void> => {
	// const { message, settings } = req.body;
	// console.log("body", req.body);
	// console.log("settings:", settings);
	// return res.json({ status: "success", message: message });
	const payload: ModifierIntegrationPayload = req.body;

	const triggerAI =
		payload.settings.find((setting) => setting.label === "@noah")
			?.default || "@noah";

	const contextDepth = Number(
		payload.settings.find((setting) => setting.label === "contextDepth")
			?.default || 10
	);

	//const debugMode

	if (payload.message.includes(triggerAI)) {
		res.json({ message: payload.message });
	}

	const channelID = "default-channel";

	const userQuery = payload.message.replace(triggerAI, "").trim();

	try {
		const message: Message = {
			id: generateUniqueId(),
			content: userQuery,
			timestamp: Date.now(),
			sender: "user",
		};

		const getAnswer: string = await ai.processMessage(userQuery, message);

		const response = await Promise.race([
			// answer,
			// await telexService.telexResponder(
			// 	payload.channelID,
			// 	await answer
			// ),
			// new Promise((accept, reject) =>
			// 	setTimeout(() => reject(new Error("Timeout")), 900)
			// ),
			// (async () => {
			// 	const answer = await getAnswer;
			// 	await telexService.telexResponder(
			// 		payload.channelID,
			// 		answer
			// 	); // Send response to Telex
			// 	return answer; // Return AI-generated response
			// })(),
			// (async () => {
			// 	await new Promise((resolve) => setTimeout(resolve, 900));
			// 	return "Sorry, I couldn't generate a response in time.";
			// })(),
			ai.processMessage(channelID, message),
			new Promise<string>((_, reject) =>
				setTimeout(() => reject(new Error("Timeout")), 900)
			),
		]);
		res.json({ message: response });
	} catch (error) {
		console.error("Webhook error", error);
		if (!res.headersSent) {
			res.status(500).json({
				error: error.message || "Internal Server Error",
			});
		}
	}
});

app.get("/integration", (req: Request, res: Response) => {
	res.json(integrationConfig);
});
