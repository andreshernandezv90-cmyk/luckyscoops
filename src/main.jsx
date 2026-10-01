import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/fonts.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/grimorio.css'
import './styles/ritual.css'
import './styles/shop.css'
import './styles/animations.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
