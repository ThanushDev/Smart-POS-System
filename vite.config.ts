// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Cloud එකේදී proxy අවශ්‍ය නැත, නමුත් Vercel Rewrites නිවැරදිව තිබිය යුතුය
});
