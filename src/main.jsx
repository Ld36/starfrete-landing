import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Carregar comando admin apenas em desenvolvimento
if (import.meta.env.DEV) {
  import('./utils/adminAccess.js');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
