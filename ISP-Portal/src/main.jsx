import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Registrar Service Worker para PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Podrías mostrar un toast avisando que hay una nueva versión
    // Por ahora, recargamos directamente para obtener la nueva versión
    updateSW(true);
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
