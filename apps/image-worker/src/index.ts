import express from "express";
import dotenv from "dotenv";
import { Kafka } from "kafkajs";
import sharp from "sharp";
import path from "path";

dotenv.config({ path: "../../.env" });

const app = express();
const port = Number(process.env.WORKER_PORT || 3001);

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "edu-platform-worker",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "image-worker",
  });
});

async function processImage(payload: any) {
  console.log("IMAGE PROCESSING STARTED");

  const originalPath = path.resolve(process.cwd(), payload.originalPath);
  const processedPath = path.resolve(
    process.cwd(),
    "../../uploads/processed",
    `processed-${payload.filename}`,
  );

  const watermarkPath = path.resolve(
    process.cwd(),
    "../../uploads/watermark/watermark.png",
  );

  const watermark = await sharp(watermarkPath).resize(150).png().toBuffer();

  await sharp(originalPath)
    .resize(800)
    .composite([
      {
        input: watermark,
        gravity: "southeast",
      },
    ])
    .jpeg({ quality: 80 })
    .toFile(processedPath);

  console.log("IMAGE PROCESSED:", processedPath);

  await producer.send({
    topic: "image.processed",
    messages: [
      {
        value: JSON.stringify({
          status: "success",
          entityType: payload.entityType,
          entityId: payload.entityId,
          field: payload.field,
          originalPath: payload.originalPath,
          processedPath,
          processedAt: new Date().toISOString(),
        }),
      },
    ],
  });

  console.log("Kafka event image.processed sent");
}

async function startKafkaConsumer() {
  const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || "image-worker-group",
  });

  await consumer.connect();
  await producer.connect();

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

      if (!rawValue) {
        return;
      }

      const payload = JSON.parse(rawValue);

      if (payload.type === "test") {
        console.log("Test message skipped");
        return;
      }

      await processImage(payload);
    },
  });
}

app.listen(port, () => {
  console.log(`Image Worker running on port ${port}`);
});

startKafkaConsumer().catch((error) => {
  console.error("Kafka consumer error:", error);
});
