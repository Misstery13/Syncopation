import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin para mapear rutas /src/ a la carpeta src real del proyecto
const mapSrcPlugin = () => {
  return {
    name: 'map-src',
    resolveId(id) {
      // Si la ruta comienza con /src/, mapearla a la carpeta src real
      if (id.startsWith('/src/')) {
        // Quitar '/src/' (5 caracteres) y construir la ruta completa
        const relativePath = id.slice(5); // Quitar '/src/'
        const filePath = path.resolve(__dirname, 'src', relativePath);
        return filePath;
      }
      return null;
    }
  };
};

export default defineConfig({
  root: 'public',   
  base: './',
  plugins: [mapSrcPlugin()],

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
      '@': path.resolve(__dirname, 'src')
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
