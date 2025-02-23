export interface Message {
	id: string;
	content: string;
	sender: string;
	timestamp: number;
}

export interface ModifierIntegrationPayload {
	channel_id: string;
	message: string;
	settings: Array<{
		label: string;
		type: string;
		default: any;
		required: boolean;
	}>;
}

export interface TelexResponse {
	event_name: string;
	message: string;
	status: string;
	username: string;
}
