import { Message } from "../types/types";

export class MessageStorage {
	private messages: Map<string, Message[]>;
	private readonly MESSAGE_LIMIT = 50;

	constructor() {
		this.messages = new Map();
	}

	addMessage(
		channelID: string,
		message: Message,
		CUSTOM_LIMIT?: number
	): Promise<void> {
		let channelMessages = this.messages.get(channelID) || [];

		channelMessages.push(message);

		if (CUSTOM_LIMIT > 0) {
			if (channelMessages.length > CUSTOM_LIMIT) {
				channelMessages = channelMessages.slice(-CUSTOM_LIMIT);
			}
		} else {
			if (channelMessages.length > this.MESSAGE_LIMIT) {
				channelMessages = channelMessages.slice(-this.MESSAGE_LIMIT);
			}
		}

		this.messages.set(channelID, channelMessages);
		return Promise.resolve();
	}

	getChannelContext(channelID: string): Promise<Message[]> {
		return Promise.resolve(this.messages.get(channelID) || []);
	}
}
