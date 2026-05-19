import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load .env before anything else
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  app.post("/api/chat", async (req, res) => {
    // Resolve key at request time so it's always fresh from env
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      res.status(500).json({
        error: "Missing API key",
        detail: "Add your Gemini API key to the .env file as GEMINI_API_KEY=... then restart the server. Get a key at https://aistudio.google.com/apikey"
      });
      return;
    }

    try {
      const { message, history, systemPrompt } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      // Build Gemini history format
      const geminiHistory = (history || [])
        .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
        .map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt || "You are Alumna, an AI academic assistant. Help students plan assignments, build study schedules, and summarize syllabi.",
        },
        history: geminiHistory,
      });

      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (error: unknown) {
      console.error("Gemini Error:", error);
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to generate response", detail: msg });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Alumna AI running on http://localhost:${PORT}`);
  });
}

startServer();