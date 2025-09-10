import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Configurações específicas para React 19
      jsxRuntime: 'automatic',
      // Desabilitar fast refresh se estiver causando problemas
      fastRefresh: true,
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Configurações para melhor estabilidade
    hmr: {
      overlay: false // Desabilitar overlay de erro que pode causar problemas
    },
    fs: {
      strict: false
    }
  },
  build: {
    // Configurações para build mais estável
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    // Incluir dependências que podem causar problemas
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
})
