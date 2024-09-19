import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }

  const prediction = await replicate.predictions.create({
    version: "8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f",
    input: { prompt: req.body.prompt },
  });

  if (prediction?.error) {
    res.status(500).json({ detail: prediction.error });
    return;
  }

  res.status(201).json(prediction);
}
