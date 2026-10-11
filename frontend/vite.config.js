import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Native loading avoids bundling the Tailwind native dependency into config code.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
});
