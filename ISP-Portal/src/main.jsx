import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Registrar Service Worker para PWA
registerSW({
  onNeedReload() {
    // Sin recarga automatica: el SW se actualiza en silencio y la version
    // nueva se aplica en la proxima visita del usuario.
  },
  onOfflineReady() {
    console.log('App lista para trabajar offline');
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
