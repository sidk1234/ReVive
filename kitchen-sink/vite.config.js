import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/kitchensink-app/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../public/kitchensink-app',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'konsta/react': path.resolve(__dirname, './konsta-src/react/konsta-react.js'),
      'konsta/theme.css': path.resolve(__dirname, './konsta-src/react/theme.css'),
    },
  },
});

