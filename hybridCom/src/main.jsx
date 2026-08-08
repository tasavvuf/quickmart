import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import LocationContext from "./context/LocationContext.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { StoreContextProvider } from "./context/StoreContext.jsx";
import { CartContextProvider } from "./context/CartContext.jsx";
import { ThemeContextProvider } from "./context/ThemeContext.jsx";
// Context Provider Hierarchy:
// 1. BrowserRouter (Enables React Router navigation inside contexts and components)
// 2. ThemeContextProvider (Global theme state)
// 3. UserContextProvider (Auth state, user profile & address book)
// 4. LocationContext (Consumes UserContext for default/saved address auto-detection)
// 5. StoreContextProvider (Consumes LocationContext for nearby store fetching)
// 6. CartContextProvider (Consumes StoreContext & UserContext for cart operations)
// 7. App (Consumes all providers)

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeContextProvider>
      <UserContextProvider>
        <LocationContext>
          <StoreContextProvider>
            <CartContextProvider>
              <App />
            </CartContextProvider>
          </StoreContextProvider>
        </LocationContext>
      </UserContextProvider>
    </ThemeContextProvider>
  </BrowserRouter>
);