// pages/api/ask.js
import { NextApiRequest, NextApiResponse } from "next";
import replicate from "../../lib/replicate-ai";
import dbConnect from "../../lib/dbConnect";
import Interaction from "../../models/Interaction";
import { getCachedResponse, setCachedResponse } from "../../lib/cache";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body;

    // Verifica o cache primeiro
    const cachedResponse = getCachedResponse(text);
    if (cachedResponse) {
      return res.status(200).json({ response: cachedResponse });
    }

    try {
      await dbConnect();
      console.log("Connected to MongoDB");

      // Criação de uma predição no Replicate
      const response = await replicate.predictions.create({
        version:
          "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
        input: {
          prompt: text,
        },
      });

      const aiMessage = response.output; // A mensagem da IA é retornada

      await Interaction.create({
        userMessage: text,
        aiResponse: aiMessage,
      });

      // Armazena a resposta no cache
      setCachedResponse(text, aiMessage);

      res.status(200).json({ response: aiMessage });
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
