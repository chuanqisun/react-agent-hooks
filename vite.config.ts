import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.lib.json",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      formats: ["es"],
      name: "ReactAgentHooks",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
