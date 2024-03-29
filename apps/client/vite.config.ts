import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

const isDev = process.env.NODE_ENV === 'development';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  ...(isDev && {
    server: {
      port: 3000,
      proxy: {
        '/socket.io': {
          target: 'ws://localhost:3001',
          ws: true,
        },
        '/api': 'http://localhost:3001',
      },
    },
  }),
});
