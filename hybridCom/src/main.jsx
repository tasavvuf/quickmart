import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LocationContext from './context/LocationContext.jsx'
import { UserContextProvider } from './context/UserContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { StoreContextProvider } from './context/StoreContext.jsx'
import { CartContextProvider } from './context/CartContext.jsx'
import { ThemeContextProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
     <BrowserRouter>
      <ThemeContextProvider>
      <LocationContext>
      <StoreContextProvider>
      <CartContextProvider>
      <UserContextProvider>
      <App />
      </UserContextProvider>
      </CartContextProvider>
      </StoreContextProvider>
 </LocationContext>
      </ThemeContextProvider>
     </BrowserRouter>


)
