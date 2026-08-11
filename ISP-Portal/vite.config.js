import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['orinet2.svg', 'Orinet.svg'],
      manifest: {
        name: 'Portal OriNet',
        short_name: 'OriNet',
        description: 'Portal de autogestión de servicios OriNet',
        theme_color: '#0d2240',
        background_color: '#0a0f1e',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'orinet2.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Excluir la carpeta api/ ya que es de netlify functions
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
})
