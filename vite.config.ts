import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true, // listen on all interfaces (needed for port-forwarding / tunnels)
      hmr: process.env.DISABLE_HMR === 'true'
        ? false
        : {
            // Tells the browser which port to connect the WebSocket on.
            // When running behind a reverse proxy or port-forward, the WS port
            // is often different from the HTTP port — set HMR_PORT env var if needed.
            clientPort: process.env.HMR_PORT ? Number(process.env.HMR_PORT) : undefined,
            // Set HMR_PROTOCOL=wss if your dev server is behind an HTTPS proxy.
            protocol: (process.env.HMR_PROTOCOL as 'ws' | 'wss') || undefined,
          },
    },
  };
});