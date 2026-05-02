import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "ChannelReact Pro API is running" });
  });

  // Proxy route for fetching channel info (simulated)
  app.get("/api/channel-preview", (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // In a real app, you'd scrape or use an official API.
    // Here we return realistic mock data based on the domain.
    const isPost = (url as string).includes("/p/");
    const name = (url as string).split("/").pop() || "WhatsApp Channel";

    res.json({
      name: isPost ? "Reaction for Post" : name.toUpperCase() + " Official",
      followers: Math.floor(Math.random() * 50000) + 1000,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      description: isPost ? "Automated reactions for this specific post." : "Official WhatsApp community for updates and news.",
      type: isPost ? "post" : "channel",
      lastUpdated: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
