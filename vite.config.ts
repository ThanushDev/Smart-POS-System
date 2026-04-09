import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  export default defineConfig({
  plugins: [react()],
  root: '.', // ව්‍යාපෘතියේ මූලික ෆෝල්ඩරය
  build: {
    outDir: 'dist', // build එක යන ෆෝල්ඩරය
  },
  // ... අනෙක් settings
});
  },
  esbuild: {
    logOverride: {
      'ignored-directive': 'silent', 
    },
  },
  logLevel: 'info', 
  build: {
    // Build එකේදී ඇතිවන ගැටලු හඳුනා ගැනීමට මෙය උපකාරී වේ
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      onwarn(warning, warn) {
        // Harmless warnings අතහරින්න
        if (
          warning.message.includes('Module level directives') ||
          warning.message.includes('"use client"')  ||
          warning.message.includes('"was ignored"')
        ) {
          return; 
        }

        // මෙතනදී 'throw new Error' වෙනුවට 'warn' පමණක් භාවිතා කරමු
        // එවිට Build එක Fail නොවී මොකක්ද ප්‍රශ්නය කියලා Log එකේ බලාගන්න පුළුවන්
        warn(warning);
      },
    },
  },
});
