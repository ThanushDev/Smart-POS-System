import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
 // vite.config.ts ඇතුළත
build: {
  outDir: 'dist',
  minify: false, // Error එක සොයාගන්නා තුරු minify අක්‍රිය කරන්න
  sourcemap: true,
},
});
