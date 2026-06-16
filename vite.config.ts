import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    // Entorno node es suficiente para testear funciones puras async
    environment: 'node',
    coverage: {
      provider: 'v8',
      // Solo medir cobertura del hook que testeamos
      include: ['src/hooks/useDolar.ts'],
      reporter: ['text', 'html'],
    },
  },
});
