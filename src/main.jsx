import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { website } from '@datapack/config.js'
import { sources } from './data/sources.js'

document.title = website.title;
const iconEl = document.querySelector("link[rel~='icon']");
if (iconEl) {
  iconEl.href = `res/${sources.res}/${website.icon}`;
  iconEl.type = 'image/png';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
