import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add a simple dev-only API endpoint to proxy AI requests to the Gemini/Vertex API.
  // This runs in the Vite dev server (node) and keeps the GEMINI_API_KEY server-side.
  configureServer: (server) => {
    const bodyParser = require('body-parser');
    server.middlewares.use(bodyParser.json());

    server.middlewares.use('/api/generate', async (req, res, next) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }
      try {
        // bodyParser.json() usually parsed the body into req.body
        let payload: any = (req as any).body ?? null;
        if (!payload) {
          // fallback: read the stream once
          payload = await new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                reject(e);
              }
            });
            req.on('error', (err) => reject(err));
          }).catch((e) => ({}));
        }
        const messages = payload.messages ?? [];
        const mood = payload.mood ?? null;

        // Build a simple prompt from the messages and mood
        const promptParts: string[] = [];
        if (mood) promptParts.push(`User mood: ${mood}`);
        promptParts.push('Conversation:');
        messages.forEach((m: any) => {
          const role = m.isUser ? 'User' : 'Assistant';
          promptParts.push(`${role}: ${m.content}`);
        });
        promptParts.push('Assistant:');
        const prompt = promptParts.join('\n');

        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY not set on server' }));
          return;
        }

        const model = process.env.GEMINI_MODEL || 'text-bison-001';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate?key=${encodeURIComponent(
          key
        )}`;

        const genResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.7, maxOutputTokens: 512 }),
        });

        const json = await genResponse.json();
        const reply = json?.candidates?.[0]?.content ?? json?.output?.[0]?.content ?? json?.candidates?.[0]?.output ?? null;
        if (!reply) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'No reply from model', raw: json }));
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ reply }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
  },
}));
