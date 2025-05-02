/// <reference types="vitest" /> // <-- ADICIONE ESTA LINHA NO TOPO DO ARQUIVO

import { defineConfig } from 'vite'; // Pode usar defineConfig, é o mais comum
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { // Agora o TypeScript deve reconhecer esta chave 'test'
    globals: true, // Habilita APIs globais do Vitest (describe, it, expect)
    environment: 'happy-dom', // Ou 'jsdom'
    setupFiles: './src/setupTests.ts', // Seu arquivo de setup existente
    // Configuração de CSS Modules (opcional se já funcionar via plugin React/Vite)
    css: {
      modules: {
        classNameStrategy: 'scoped',
      },
    },
  },
  // Outras configurações do Vite que você possa ter (server, build, etc.)
});