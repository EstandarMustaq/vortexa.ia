import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import Feedback from '../../models/Feedback';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userMessage, aiResponse, feedback } = req.body;

    try {
      await dbConnect();
      await Feedback.create({
        userMessage,
        aiResponse,
        feedback,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

