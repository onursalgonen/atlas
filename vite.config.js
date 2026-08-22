import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Atlas — offline-first proje yönetimi
// WiFi bağlantısı koptuğunda uygulama son senkronize veriyle
// IndexedDB (Dexie) üzerinden bellekten çalışmaya devam eder.
export default defineConfig({
  // Bu proje bilinçli olarak tek klasörde (alt klasörsüz) tutuluyor.
  // Bu yüzden public/ dizini yerine proje kökü publicDir olarak
  // ayarlandı — ikon dosyaları build çıktısına buradan kopyalanır.
  publicDir: '.',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Atlas — Proje Yöneticisi',
        short_name: 'Atlas',
        description: 'Offline çalışabilen proje ve görev yönetim aracı',
        theme_color: '#12213A',
        background_color: '#0B1526',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Uygulama kabuğu + statik varlıklar cache-first: internet
        // olmasa da arayüz anında açılır. Veri katmanı (Dexie/IndexedDB)
        // ayrıca src/lib/db.js üzerinden yönetiliyor.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            // TradingView widget script'i: online iken cache'e alınır,
            // offline'da son alınan sürüm kullanılır.
            urlPattern: /^https:\/\/s3\.tradingview\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'tradingview-assets' }
          }
        ]
      }
    })
  ],
  server: { host: true }
})
