import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global styles import (tokens first so index.css + components can use the vars)
import './styles/tokens.css'
import './index.css'

// Root application component
import App from './App.jsx'

// Mounting React application to DOM element with id 'root'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the offline-fallback service worker — production builds only, so dev
// is never affected. It only serves an offline page; it never caches app assets.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}