import { TelexResponse } from "../types/types";

export class TelexService {
	private baseUrl = "https://ping.telex.im/v1/webhooks";

	async telexResponder(channelID: string, content: string) {
		const payload: TelexResponse = {
			message: content,
			status: "success",
			username: "AI",
			event_name: "message_formatted",
		};

		try {
			const result = await fetch(`${this.baseUrl}/${channelID}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!result.ok) {
				throw new Error(`Failed to send message: ${result.statusText}`);
			}
		} catch (error) {
			console.error("Error sending message to Telex:", error);
			throw error;
		}
	}
}
