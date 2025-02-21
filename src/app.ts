import express from "express";
import { integrationConfig } from "../config/telexIntegrationConfig";
import { defaultConfig } from "../config/defaultConfig";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log("Default config on startup:", defaultConfig);
	return console.log(`Express is listening at http://localhost:${port}`);
});

app.get("/integration", (req, res) => {
	console.log("Trying integration rn");
	res.send(defaultConfig);
});
