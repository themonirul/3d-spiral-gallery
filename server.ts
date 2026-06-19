import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client to prevent crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required to authenticate the AI.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for AI Art curation analysis
app.post("/api/gemini/curate", async (req, res) => {
  try {
    const { prompt, chatHistory } = req.body;
    const client = getGeminiClient();

    // Map chatHistory to Gemini API contents format
    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { sender: string; text: string }) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Append latest prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const result = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are the resident Principal Curator, Art Historian, and WebGL Shader Mathematician for the interactive 3D Cylindrical Spiral Helix Gallery v3.0. 
Your goal is to critique the selected artwork with deep poetic resonance, analyze its visual lighting/composition, and (when spacing is appropriate or when asked) explain the elegant mathematics behind curved deformation shaders.
Explain how the custom View-Space vertex shader curvature formula:
'viewPosition.x += pow(worldPosition.y, 2.0) * 0.1'
creates global cylindrical bowing. Notice how it takes the world y-coordinate squared and moves the viewport x position outward, yielding architectural symmetry.
Keep responses concise, aesthetically refined, inspiring, and professional. Avoid raw developer files unless specifically requested.`,
      },
    });

    res.json({ text: result.text });
  } catch (err: any) {
    console.error("Express Gemini curate error:", err);
    res.status(500).json({ error: err.message || "curator server failure" });
  }
});

async function startServer() {
  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware for development");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html as fallback for any SPA routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from /dist and fallback to index.html");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();
