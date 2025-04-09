import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "ReactAgentHooks",
      fileName: "react-agent-hooks",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
