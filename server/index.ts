import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Minimal Express server so esbuild has a valid entry.
// This serves the built client from the same dist folder where esbuild outputs index.js.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Serve static assets from dist (Vite build output)
app.use(express.static(__dirname));

// Fallback to index.html for SPA routes if present
app.get("*", (req, res) => {
  const indexHtml = path.join(__dirname, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(404).send("Not found");
    }
  });
});

app.listen(port, () => {
  console.log(`[server] Running on http://localhost:${port}`);
});
