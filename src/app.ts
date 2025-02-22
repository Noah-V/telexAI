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
	"*",
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

app.post("/webhook", async (req: any, res: any) => {
	// const { message, settings } = req.body;
	// console.log("body", req.body);
	// console.log("settings:", settings);
	// return res.json({ status: "success", message: message });
	try {
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
			return res.json({ message: payload.message });
		}

		const userQuery = payload.message.replace(triggerAI, "").trim();

		try {
			const message: Message = {
				id: generateUniqueId(),
				content: payload.message,
				timestamp: Date.now(),
				sender: "user",
			};

			var answer: string;

			const response = await Promise.race([
				(answer = await ai.processMessage(
					userQuery,
					message,
					payload.channelID
				)),
				await telexService.telexResponder(payload.channelID, answer),
				new Promise((accept, reject) =>
					setTimeout(() => reject(new Error("Timeout")), 900)
				),
			]);
			await telexService.telexResponder(payload.channelID, answer);
			return res.json({ message: res });
		} catch (error) {
			console.error("Timeout", error);
			return res.json({ message: payload.message });
		}
	} catch (error) {
		console.error("Webhook error:", error);
		return res.json({ message: req.body.message });
	}
});

app.get("/integration", (req, res) => {
	console.log("Trying integration rn");
	res.send(integrationConfig);
});
