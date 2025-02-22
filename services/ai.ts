import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageStorage } from "./storage";
import { Message } from "../types/types";

export class AI {
	private model: any;
	private storage: MessageStorage;

	constructor(apiKey: string, storage: MessageStorage) {
		const genAI = new GoogleGenerativeAI(apiKey);
		this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
		this.storage = storage;
	}

	private context(messages: Message[]): string {
		return messages
			.map(
				(eachMessage) => `${eachMessage.sender}: ${eachMessage.content}`
			)
			.join("\n");
	}

	// async processMessage(channelID: string, message: Message): Promise<string> {
	// 	await this.storage.addMessage(channelID, message);

	// 	const channelContext = await this.storage.getChannelContext(channelID);

	// 	//applying context
	// 	const contextString = this.context(channelContext);

	// 	const prompt = `I am noah, I know. I am your all knowing "assistant" on telex

	//     ----
	//     ${contextString}
	//     ----
	//     User: ${message.content}
	//     AI:

	//     `;

	// 	const result = await this.model.generateContent({ prompt });
	// 	const response = await result.response;
	// 	if (!response)
	// 		throw new Error(
	// 			"We are experiencing technical issues at this point in time"
	// 		);
	// 	return response.text();
	// }

	async processMessage(
		question: string,
		message: Message,
		channelID: string
	): Promise<string> {
		try {
			await this.storage.addMessage(channelID, message);

			const channelContext = await this.storage.getChannelContext(
				channelID
			);

			//applying context
			const contextString = this.context(channelContext);

			const prompt = `I am noah, I know. I am your all knowing "assistant" on telex
			
			----
			${contextString}
			----
			User: ${message.content}
			AI: 
	
			`;

			const result = await this.model.generateContent({ prompt });
			const response = await result.response;
			if (!response)
				throw new Error(
					"We are experiencing technical issues at this point in time"
				);
			return response.text();
		} catch (error) {
			console.error("Error", error);
			throw new Error("AI is experiencing difficulty right now ");
		}
	}
}
