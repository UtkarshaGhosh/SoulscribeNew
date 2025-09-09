var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///app/code/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/app/code";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // Add a simple dev-only API endpoint to proxy AI requests to the Gemini/Vertex API.
  // This runs in the Vite dev server (node) and keeps the GEMINI_API_KEY server-side.
  configureServer: (server) => {
    const bodyParser = __require("body-parser");
    server.middlewares.use(bodyParser.json());
    server.middlewares.use("/api/generate", async (req, res, next) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }
      try {
        const payload = req.body ?? {};
        const messages = payload.messages ?? [];
        const mood = payload.mood ?? null;
        const promptParts = [];
        if (mood) promptParts.push(`User mood: ${mood}`);
        promptParts.push("Conversation:");
        messages.forEach((m) => {
          const role = m.isUser ? "User" : "Assistant";
          promptParts.push(`${role}: ${m.content}`);
        });
        promptParts.push("Assistant:");
        const prompt = promptParts.join("\n");
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "GEMINI_API_KEY not set on server" }));
          return;
        }
        const model = process.env.GEMINI_MODEL || "text-bison-001";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate?key=${encodeURIComponent(
          key
        )}`;
        const genResponse = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.7, maxOutputTokens: 512 })
        });
        const json = await genResponse.json();
        const reply = json?.candidates?.[0]?.content ?? json?.output?.[0]?.content ?? json?.candidates?.[0]?.output ?? null;
        if (!reply) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "No reply from model", raw: json }));
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ reply }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2NvZGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgLy8gQWRkIGEgc2ltcGxlIGRldi1vbmx5IEFQSSBlbmRwb2ludCB0byBwcm94eSBBSSByZXF1ZXN0cyB0byB0aGUgR2VtaW5pL1ZlcnRleCBBUEkuXG4gIC8vIFRoaXMgcnVucyBpbiB0aGUgVml0ZSBkZXYgc2VydmVyIChub2RlKSBhbmQga2VlcHMgdGhlIEdFTUlOSV9BUElfS0VZIHNlcnZlci1zaWRlLlxuICBjb25maWd1cmVTZXJ2ZXI6IChzZXJ2ZXIpID0+IHtcbiAgICBjb25zdCBib2R5UGFyc2VyID0gcmVxdWlyZSgnYm9keS1wYXJzZXInKTtcbiAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGJvZHlQYXJzZXIuanNvbigpKTtcblxuICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvZ2VuZXJhdGUnLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XG4gICAgICAgIHJlcy5lbmQoJ01ldGhvZCBOb3QgQWxsb3dlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICAvLyBib2R5UGFyc2VyLmpzb24oKSBhbHJlYWR5IHBhcnNlZCB0aGUgYm9keSBpbnRvIHJlcS5ib2R5XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSAocmVxIGFzIGFueSkuYm9keSA/PyB7fTtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBwYXlsb2FkLm1lc3NhZ2VzID8/IFtdO1xuICAgICAgICBjb25zdCBtb29kID0gcGF5bG9hZC5tb29kID8/IG51bGw7XG5cbiAgICAgICAgLy8gQnVpbGQgYSBzaW1wbGUgcHJvbXB0IGZyb20gdGhlIG1lc3NhZ2VzIGFuZCBtb29kXG4gICAgICAgIGNvbnN0IHByb21wdFBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBpZiAobW9vZCkgcHJvbXB0UGFydHMucHVzaChgVXNlciBtb29kOiAke21vb2R9YCk7XG4gICAgICAgIHByb21wdFBhcnRzLnB1c2goJ0NvbnZlcnNhdGlvbjonKTtcbiAgICAgICAgbWVzc2FnZXMuZm9yRWFjaCgobTogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3Qgcm9sZSA9IG0uaXNVc2VyID8gJ1VzZXInIDogJ0Fzc2lzdGFudCc7XG4gICAgICAgICAgcHJvbXB0UGFydHMucHVzaChgJHtyb2xlfTogJHttLmNvbnRlbnR9YCk7XG4gICAgICAgIH0pO1xuICAgICAgICBwcm9tcHRQYXJ0cy5wdXNoKCdBc3Npc3RhbnQ6Jyk7XG4gICAgICAgIGNvbnN0IHByb21wdCA9IHByb21wdFBhcnRzLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgIGNvbnN0IGtleSA9IHByb2Nlc3MuZW52LkdFTUlOSV9BUElfS0VZO1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0dFTUlOSV9BUElfS0VZIG5vdCBzZXQgb24gc2VydmVyJyB9KSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kZWwgPSBwcm9jZXNzLmVudi5HRU1JTklfTU9ERUwgfHwgJ3RleHQtYmlzb24tMDAxJztcbiAgICAgICAgY29uc3QgYXBpVXJsID0gYGh0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YTIvbW9kZWxzLyR7bW9kZWx9OmdlbmVyYXRlP2tleT0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICBrZXlcbiAgICAgICAgKX1gO1xuXG4gICAgICAgIGNvbnN0IGdlblJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYXBpVXJsLCB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBwcm9tcHQ6IHsgdGV4dDogcHJvbXB0IH0sIHRlbXBlcmF0dXJlOiAwLjcsIG1heE91dHB1dFRva2VuczogNTEyIH0pLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgZ2VuUmVzcG9uc2UuanNvbigpO1xuICAgICAgICBjb25zdCByZXBseSA9IGpzb24/LmNhbmRpZGF0ZXM/LlswXT8uY29udGVudCA/PyBqc29uPy5vdXRwdXQ/LlswXT8uY29udGVudCA/PyBqc29uPy5jYW5kaWRhdGVzPy5bMF0/Lm91dHB1dCA/PyBudWxsO1xuICAgICAgICBpZiAoIXJlcGx5KSB7XG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTm8gcmVwbHkgZnJvbSBtb2RlbCcsIHJhdzoganNvbiB9KSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHJlcGx5IH0pKTtcbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFN0cmluZyhlcnIpIH0pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQTZNLFNBQVMsb0JBQW9CO0FBQzFPLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUEsRUFHQSxpQkFBaUIsQ0FBQyxXQUFXO0FBQzNCLFVBQU0sYUFBYSxVQUFRLGFBQWE7QUFDeEMsV0FBTyxZQUFZLElBQUksV0FBVyxLQUFLLENBQUM7QUFFeEMsV0FBTyxZQUFZLElBQUksaUJBQWlCLE9BQU8sS0FBSyxLQUFLLFNBQVM7QUFDaEUsVUFBSSxJQUFJLFdBQVcsUUFBUTtBQUN6QixZQUFJLGFBQWE7QUFDakIsWUFBSSxJQUFJLG9CQUFvQjtBQUM1QjtBQUFBLE1BQ0Y7QUFDQSxVQUFJO0FBRUYsY0FBTSxVQUFXLElBQVksUUFBUSxDQUFDO0FBQ3RDLGNBQU0sV0FBVyxRQUFRLFlBQVksQ0FBQztBQUN0QyxjQUFNLE9BQU8sUUFBUSxRQUFRO0FBRzdCLGNBQU0sY0FBd0IsQ0FBQztBQUMvQixZQUFJLEtBQU0sYUFBWSxLQUFLLGNBQWMsSUFBSSxFQUFFO0FBQy9DLG9CQUFZLEtBQUssZUFBZTtBQUNoQyxpQkFBUyxRQUFRLENBQUMsTUFBVztBQUMzQixnQkFBTSxPQUFPLEVBQUUsU0FBUyxTQUFTO0FBQ2pDLHNCQUFZLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFBQSxRQUMxQyxDQUFDO0FBQ0Qsb0JBQVksS0FBSyxZQUFZO0FBQzdCLGNBQU0sU0FBUyxZQUFZLEtBQUssSUFBSTtBQUVwQyxjQUFNLE1BQU0sUUFBUSxJQUFJO0FBQ3hCLFlBQUksQ0FBQyxLQUFLO0FBQ1IsY0FBSSxhQUFhO0FBQ2pCLGNBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxPQUFPLG1DQUFtQyxDQUFDLENBQUM7QUFDckU7QUFBQSxRQUNGO0FBRUEsY0FBTSxRQUFRLFFBQVEsSUFBSSxnQkFBZ0I7QUFDMUMsY0FBTSxTQUFTLDREQUE0RCxLQUFLLGlCQUFpQjtBQUFBLFVBQy9GO0FBQUEsUUFDRixDQUFDO0FBRUQsY0FBTSxjQUFjLE1BQU0sTUFBTSxRQUFRO0FBQUEsVUFDdEMsUUFBUTtBQUFBLFVBQ1IsU0FBUyxFQUFFLGdCQUFnQixtQkFBbUI7QUFBQSxVQUM5QyxNQUFNLEtBQUssVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sR0FBRyxhQUFhLEtBQUssaUJBQWlCLElBQUksQ0FBQztBQUFBLFFBQzNGLENBQUM7QUFFRCxjQUFNLE9BQU8sTUFBTSxZQUFZLEtBQUs7QUFDcEMsY0FBTSxRQUFRLE1BQU0sYUFBYSxDQUFDLEdBQUcsV0FBVyxNQUFNLFNBQVMsQ0FBQyxHQUFHLFdBQVcsTUFBTSxhQUFhLENBQUMsR0FBRyxVQUFVO0FBQy9HLFlBQUksQ0FBQyxPQUFPO0FBQ1YsY0FBSSxhQUFhO0FBQ2pCLGNBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxPQUFPLHVCQUF1QixLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQ25FO0FBQUEsUUFDRjtBQUVBLFlBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELFlBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUFBLE1BQ25DLFNBQVMsS0FBVTtBQUNqQixZQUFJLGFBQWE7QUFDakIsWUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8sT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQUEsTUFDaEQ7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
