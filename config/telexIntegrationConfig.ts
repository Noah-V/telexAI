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
			app_url: "https://fc41tnk2-3000.uks1.devtunnels.ms",
			background_color: "#FFFFFF",
		},
		is_active: true,
		integration_type: "modifier",
		integration_category: "AI & Machine Learning",
		key_features: [
			"Feature description 1.",
			"Feature description 2.",
			"Feature description 3.",
			"Feature description 4.",
		],
		author: "Noah Vikoo",
		settings: [
			{
				label: "aiTriggerWord",
				type: "text",
				description:
					"Word to trigger AI responses (default: @telex-ai)",
				default: "@telex-ai",
				required: true,
			},
			{
				label: "contextDepth",
				type: "number",
				description:
					"Number of messages to maintain for context (max 50)",
				default: 10,
				required: false,
			},
			{
				label: "debugMode",
				type: "checkbox",
				description: "Enable detailed debugging output",
				default: false,
				required: false,
			},
			{
				label: "aiPersonality",
				type: "dropdown",
				description: "AI response style",
				options: ["technical", "friendly", "concise", "detailed"],
				default: "technical",
				required: false,
			},
			{
				label: "teamNotification",
				type: "multi-select",
				description: "When to notify team members",
				options: [
					"critical-errors",
					"debugging-sessions",
					"ai-mentions",
				],
				default: ["critical-errors"],
				required: false,
			},
		],
		target_url: "https://fc41tnk2-3000.uks1.devtunnels.ms/webhook",
		tick_url: "https://fc41tnk2-3000.uks1.devtunnels.ms/integration",
	},
};
