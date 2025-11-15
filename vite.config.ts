import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // root: 'public',   <--- Comentado por Carlos F. Patiño para corregir errores de ruta en los tests
  base: './',

  // agregado por: Carlos F. Patiño
  // Para permitir pruebas con Vitest
  test: {
    include: ['tests/*.spec.ts'],
    globals: true, // Permite usar 'describe', 'it', 'expect' globalmente
    environment: 'node',
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
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    port: 3000,
    open: true
  },
  esbuild: {
    target: 'es2020'
  }
});
