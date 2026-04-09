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
  build: {
    outDir: 'dist',
    rollupOptions: {
      // මෙතැනදී සියලුම warnings පෙන්වීමට සලස්වන්න, එවිට log එකේ error එක දැකගත හැක
      onwarn(warning, warn) {
        warn(warning);
      },
    },
  },
});
