import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LocationContext from './context/LocationContext.jsx'

createRoot(document.getElementById('root')).render(
 <LocationContext>
      <App />

 </LocationContext>

)
