import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin para mapear rutas /src/ a la carpeta src real del proyecto
// (Reemplazado por alias en resolve)

export default defineConfig({
  root: 'public',
  base: './',
  plugins: [], // Removed mapSrcPlugin

  // agregado por: Carlos F. Patiño
  // Para permitir pruebas con Vitest
  test: {
    include: ['tests/*.spec.ts'],
    globals: true, // Permite usar 'describe', 'it', 'expect' globalmente
    environment: 'node',
    root: path.resolve(__dirname),
  },



  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: path.resolve(__dirname, 'public/index.html')
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/src': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    fs: {
      allow: ['..']
    }
  },
  preview: {
    port: 3000,
    open: true
  },
  esbuild: {
    target: 'es2020'
  }
});
