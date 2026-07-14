import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const apiUrl =
    env.VITE_API_URL ||
    'http://localhost:5000/api';

  return {
    plugins: [react(), tailwindcss()],

    define: {
      __APP_API_URL__: JSON.stringify(apiUrl),
    },
  };
});