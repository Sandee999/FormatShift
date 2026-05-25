import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  base: '/FormatShift/', // Using Github Pages
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    // Prevents Vite from trying to pre-bundle the heavy node-based webassembly binaries
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  build:{
    sourcemap: false,
  }
});
