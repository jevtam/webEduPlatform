import express from "express";
import dotenv from "dotenv";
import { Kafka } from "kafkajs";

dotenv.config({ path: "../../.env" });

const app = express();
const port = Number(process.env.WORKER_PORT || 3001);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "image-worker",
  });
});

async function startKafkaConsumer() {
  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "edu-platform-worker",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || "image-worker-group",
  });

  await consumer.connect();
  await consumer.subscribe({
    topic: "image.uploaded",
    fromBeginning: false,
  });

  console.log("Kafka consumer connected");
  console.log("Listening topic: image.uploaded");

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const rawValue = message.value?.toString();

      console.log("Kafka message received:");
      console.log("Topic:", topic);
      console.log("Value:", rawValue);
    },
  });
}

app.listen(port, () => {
  console.log(`Image Worker running on port ${port}`);
});

startKafkaConsumer().catch((error) => {
  console.error("Kafka consumer error:", error);
});

setTimeout(async () => {
  console.log("TEST IMAGE PROCESSING");

  const sharp = require("sharp");

  const watermark = await sharp("../../uploads/watermark/watermark.png")
    .resize(150)
    .png()
    .toBuffer();

  await sharp("../../uploads/originals/test-cover.jpg")
    .resize(800)
    .composite([
      {
        input: watermark,
        gravity: "southeast",
      },
    ])
    .jpeg({ quality: 80 })
    .toFile("../../uploads/processed/test-cover-processed.jpg");

  console.log("IMAGE PROCESSED");
}, 3000);
