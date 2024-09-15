// pages/api/ask.js
import { NextApiRequest, NextApiResponse } from 'next';
import openai from '../../lib/openai';
import dbConnect from '../../lib/dbConnect';
import Interaction from '../../models/Interaction';
import { getCachedResponse, setCachedResponse } from '../../lib/cache'; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    // Verifica o cache primeiro
    const cachedResponse = getCachedResponse(text);
    if (cachedResponse) {
      return res.status(200).json({ response: cachedResponse });
    } 

    try {
      await dbConnect();
      console.log('Connected to MongoDB');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: text }],
        max_tokens: 50,
        temperature: 0.7,
      });

      const aiMessage = response.choices[0].message.content.trim();
      
      await Interaction.create({
        userMessage: text,
        aiResponse: aiMessage,
      });

      // Armazena a resposta no cache
      setCachedResponse(text, aiMessage);

      res.status(200).json({ response: aiMessage });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

