import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LocationContext from './context/LocationContext.jsx'
import { UserContextProvider } from './context/UserContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { StoreContextProvider } from './context/StoreContext.jsx'

createRoot(document.getElementById('root')).render(
     <BrowserRouter>
      <LocationContext>
      <StoreContextProvider>
      <UserContextProvider>
      <App />
      </UserContextProvider>
      </StoreContextProvider>
 </LocationContext>
     </BrowserRouter>


)
