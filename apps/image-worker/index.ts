import express from "express";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const app = express();
const port = Number(process.env.WORKER_PORT || 3001);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Worker running on port ${port}`);
});