import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LocationContext from './context/LocationContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
     <BrowserRouter>
      <LocationContext>
      <App />
 </LocationContext>
     </BrowserRouter>


)
