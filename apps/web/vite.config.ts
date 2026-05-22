import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const sharedSourcePath = fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@chess-ledger/shared': sharedSourcePath
    }
  },
  server: {
    fs: {
      allow: [workspaceRoot]
    },
    port: 5173,
    strictPort: true
  }
});
