import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// port 8843 keeps the same origin as the original PowerShell server,
// so localStorage state (marks, tracker, my team, caches) carries over
export default defineConfig({
  plugins: [react()],
  server: { port: 8843, strictPort: true },
  preview: { port: 8843, strictPort: true },
});
