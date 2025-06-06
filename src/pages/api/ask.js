// pages/api/ask.js
import fetch from "node-fetch";
import { NextApiRequest, NextApiResponse } from "next";
import groq from "../../lib/groq-ai";  
import dbConnect from "../../lib/dbConnect";
import Interaction from "../../models/Interaction";
import { getCachedResponse, setCachedResponse } from "../../lib/cache";
import systemContent from "./sys/sysCt";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body;

    // 1. Verifica se já existe algo em cache
    const cachedResponse = getCachedResponse(text);
    if (cachedResponse) {
      return res.status(200).json({ response: cachedResponse });
    }

    try {
      // 2. Conecta ao MongoDB
      await dbConnect();
      console.log("Connected to MongoDB");

      const messages = [
        { role: "system", content: systemContent },
        { role: "user", content: text },
      ];

      // (3.1) Cria a “chat completion” no Groq
      const chatCompletion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: messages,
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false, 
        stop: null,
        seed: 1,
      });

      const aiMessage = chatCompletion.choices?.[0]?.message?.content;
      if (!aiMessage) {
        throw new Error("Não foi possível extrair a mensagem do Groq.");
      }

      //  Salva a interação no MongoDB
      await Interaction.create({
        userMessage: text,
        aiResponse: aiMessage,
      });

      //  Armazena no cache para a próxima vez
      setCachedResponse(text, aiMessage);

      //  Retorna para o front-end
      res.status(200).json({ response: aiMessage });
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "Ocorreu um erro ao processar sua solicitação." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

