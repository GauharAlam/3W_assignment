import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev server runs on :5173. The API base URL is injected via
// VITE_API_URL (see .env.example). Defaults to local backend :5000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
