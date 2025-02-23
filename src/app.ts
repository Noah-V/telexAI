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

const AiProcessing = async (payload: ModifierIntegrationPayload) => {
	try {
	} catch (error) {
		console.error("Error processing AI response:", error);
		await telexService.telexResponder(
			payload.channel_id,
			"Sorry, I encountered an error processing your request."
		);
	}
};

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

	const channelID = payload.channel_id;

	const userQuery = payload.message.replace(triggerAI, "").trim();

	if (!payload.message.includes(triggerAI)) {
		return;
	}

	const message: Message = {
		id: generateUniqueId(),
		content: userQuery,
		timestamp: Date.now(),
		sender: "user",
	};

	const timer = Date.now();

	try {
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(
				() => reject(new Error("Timeout")),
				1000 - (Date.now() - timer)
			);
		});

		const aiResponsePromise = ai.processMessage(
			channelID,
			message,
			contextDepth
		);

		try {
			// Race between AI response and timeout
			const aiAnswer = await Promise.race([
				aiResponsePromise,
				timeoutPromise,
			]);
			await telexService.telexResponder(channelID, aiAnswer as string);
		} catch (timeoutError) {
			// If we hit timeout, send "Processing..." message
			await telexService.telexResponder(
				channelID,
				"Processing your request..."
			);

			// Continue processing AI response in background
			aiResponsePromise
				.then(async (aiAnswer) => {
					await telexService.telexResponder(channelID, aiAnswer);
				})
				.catch(async (error) => {
					console.error("AI Processing Error:", error);
					await telexService.telexResponder(
						channelID,
						"Sorry, I encountered an error processing your request."
					);
				});
		}
	} catch (error) {
		console.error("Error processing message:", error);
		await telexService.telexResponder(
			channelID,
			"Sorry, I encountered an error processing your request."
		);
	}
});

app.get("/integration", (req: Request, res: Response) => {
	res.json(integrationConfig);
});
