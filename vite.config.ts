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

        // Build contents for Gemini generateContent API
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        // Formatting guidance: numbered, concise, actionable steps. Preambles allowed.
        contents.push({ role: 'user', parts: [{ text: 'Format: Respond as a numbered list of concise, actionable steps using 1., 2., 3. Order steps logically and keep each step clear. Preambles are allowed.' }] });
        // Few-shot example demonstrating target format
        contents.push({ role: 'user', parts: [{ text: 'Example question: How can I improve my sleep routine?' }] });
        contents.push({ role: 'model', parts: [{ text: '1. Set a consistent bedtime and wake time.\n2. Limit screens 60 minutes before bed.\n3. Avoid caffeine after mid-afternoon.\n4. Keep your room dark, cool, and quiet.\n5. Use a brief wind-down like reading or breathwork.' }] });
        if (mood) {
          contents.push({ role: 'user', parts: [{ text: `My current mood is: ${mood}.` }] });
        }
        messages.forEach((m: any) => {
          contents.push({ role: m.isUser ? 'user' : 'model', parts: [{ text: String(m.content ?? '') }] });
        });

        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY not set on server' }));
          return;
        }

        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          key
        )}`;

        const genResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.3, topP: 0.8, topK: 40, maxOutputTokens: 512 },
          }),
        });

        const json = await genResponse.json();
        const firstCandidate = json?.candidates?.[0] ?? null;
        const parts = firstCandidate?.content?.parts ?? [];
        const textReply = Array.isArray(parts)
          ? parts.map((p: any) => p?.text).filter(Boolean).join('\n')
          : '';

        const reply = textReply && textReply.trim().length > 0 ? textReply : null;
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
