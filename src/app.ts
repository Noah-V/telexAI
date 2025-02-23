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
		payload.settings.find((setting) => setting.label === "@telex-ai")
			?.default || "@telex-ai";

	const contextDepth = Number(
		payload.settings.find((setting) => setting.label === "contextDepth")
			?.default || 0
	);

	//const debugMode

	if (!payload.message.includes(triggerAI)) {
		console.log(
			"Message does not start with trigger; returning immediately."
		);
		res.json({ message: payload.message });
		return;
	}

	const channelID = payload.channel_id;

	const userQuery = payload.message.replace(triggerAI, "").trim();

	// res.json({ status: "success", message: "Processing..." });

	try {
		const message: Message = {
			id: generateUniqueId(),
			content: userQuery,
			timestamp: Date.now(),
			sender: "user",
		};

		const aiProcessPromise = ai.processMessage(
			channelID,
			message,
			contextDepth
		);

		console.log("AI Reply: ", aiProcessPromise);

		const timeoutPromise = new Promise<string | null>((resolve) => {
			setTimeout(() => resolve(null), 900);
		});

		let answer: string | null = await Promise.race([
			aiProcessPromise,
			timeoutPromise,
		]);

		console.log("Answer: ", answer);

		if (answer !== null) {
			await telexService.telexResponder(channelID, answer);
			res.json({ status: "success", message: answer });
		} else {
			res.json({ status: "success", message: "Processing..." });
			aiProcessPromise
				.then((aiAnswer: string) => {
					telexService.telexResponder(channelID, aiAnswer);
				})
				.catch((error) =>
					console.error("AI Processing error: ", error)
				);
		}
	} catch (error) {
		console.error("Webhook error: ", error);
		if (!res.headersSent) {
			res.status(500).json({
				status: "error",
			});
		}
	}

	// try {
	// 	const getAnswer: string = await ai.processMessage(
	// 		channelID,
	// 		message,
	// 		contextDepth
	// 	);
	// 	console.log("AI Reply: ", getAnswer);

	// 	const response = await Promise.race([
	// 		// answer,
	// 		// await telexService.telexResponder(
	// 		// 	payload.channelID,
	// 		// 	await answer
	// 		// ),
	// 		// new Promise((accept, reject) =>
	// 		// 	setTimeout(() => reject(new Error("Timeout")), 900)
	// 		// ),
	// 		// (async () => {
	// 		// 	const answer = await getAnswer;
	// 		// 	await telexService.telexResponder(
	// 		// 		payload.channelID,
	// 		// 		answer
	// 		// 	); // Send response to Telex
	// 		// 	return answer; // Return AI-generated response
	// 		// })(),
	// 		// (async () => {
	// 		// 	await new Promise((resolve) => setTimeout(resolve, 900));
	// 		// 	return "Sorry, I couldn't generate a response in time.";
	// 		// })(),
	// 		telexService.telexResponder(channelID, getAnswer),
	// 		new Promise<string>((_, reject) =>
	// 			setTimeout(() => reject(new Error("Timeout")), 900)
	// 		),
	// 	]);
	// 	res.json({ status: "success", message: response });
	// } catch (error) {
	// 	console.error("Webhook error", error);
	// 	if (!res.headersSent) {
	// 		res.status(500).json({
	// 			error: error.message || "Internal Server Error",
	// 		});
	// 	}
	// }
});

app.get("/integration", (req: Request, res: Response) => {
	res.json(integrationConfig);
});
