// lib/groq-ai.js

import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_TOKEN,
});

export default groq;

