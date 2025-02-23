export const integrationConfig = {
	data: {
		date: {
			created_at: "2025-02-21",
			updated_at: "2025-02-21",
		},
		descriptions: {
			app_description: "Telex's own very AI",
			app_logo: "https://docs.telex.im/img/telex.webp",
			app_name: "Telex AI",
			app_url: "https://telexai-1.onrender.com",
			background_color: "#FFFFFF",
		},
		is_active: true,
		integration_type: "modifier",
		integration_category: "AI & Machine Learning",
		key_features: [
			"AI Assistance",
			"Chat GPT who?",
			"Debugging Assistance(coming soon)",
		],
		author: "Noah Vikoo",
		settings: [
			{
				label: "aiTriggerWord",
				type: "text",
				description: "Word to trigger AI responses (default: @noah)",
				default: "@telex-ai",
				required: true,
			},
			{
				label: "contextDepth",
				type: "number",
				description:
					"Number of messages to maintain for context (max 50)",
				default: 0,
				required: false,
			},
			{
				label: "debugMode",
				type: "checkbox",
				description: "Enable detailed debugging output",
				default: false,
				required: false,
			},
		],
		target_url: "https://telexai-1.onrender.com/webhook",
	},
};
