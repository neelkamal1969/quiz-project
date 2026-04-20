import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global styles import
import './index.css'

// Root application component
import App from './App.jsx'

// Mounting React application to DOM element with id 'root'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)