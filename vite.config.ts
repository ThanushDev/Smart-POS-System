import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path"; // මෙය අනිවාර්යයෙන්ම අවශ්‍යයි

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@' ලකුණ භාවිතා කර src folder එකට පාර පෙන්වීම
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    logOverride: {
      'ignored-directive': 'silent', 
    },
  },
  logLevel: 'info', 
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.message.includes('Module level directives') ||
          warning.message.includes('"use client"')  ||
          warning.message.includes('"was ignored"')
        ) {
          return; 
        }

        if (warning.code === 'UNRESOLVED_IMPORT') {
          throw new Error(`Build failed due to unresolved import:\n${warning.message}`);
        }

        if (warning.code === 'PLUGIN_WARNING' && /is not exported/.test(warning.message)) {
          throw new Error(`Build failed due to missing export:\n${warning.message}`);
        }

        warn(warning);
      },
    },
  },
});
