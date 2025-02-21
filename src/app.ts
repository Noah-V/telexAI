import express from "express";
import { integrationConfig } from "../config/telexIntegrationConfig";
import { defaultConfig } from "../config/defaultConfig";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

app.post("/webhook", (req, res) => {
	console.log("body", req.body);
});

app.get("/integration", (req, res) => {
	console.log("Trying integration rn");
	res.send(defaultConfig);
});
