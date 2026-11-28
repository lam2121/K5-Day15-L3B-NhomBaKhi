import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// `vite build --mode student` -> ../student (served at /)
// `vite build --mode admin`   -> ../admin   (served at /admin/)
// `vite` (dev) serves web/ so both /student/ and /admin/ open with ?mock=1.
export default defineConfig(({ mode }) => {
  const app = mode === 'student' || mode === 'admin' ? mode : null;
  return {
    plugins: [react()],
    root: app ? resolve(__dirname, app) : __dirname,
    base: app === 'admin' ? '/admin/' : './',
    publicDir: false,
    build: {
      outDir: app ? resolve(__dirname, '..', app) : resolve(__dirname, 'dist'),
      emptyOutDir: true,
      assetsDir: 'assets',
      target: 'es2019',
    },
    server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:8000' } },
  };
});
