import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/hooks/useDolar.ts'],
      reporter: ['text', 'html'],
    },
  },
});