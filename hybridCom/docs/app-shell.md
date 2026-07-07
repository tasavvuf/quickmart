# Application shell

Source files:

- `src/main.jsx`
- `src/App.jsx`

## `src/main.jsx`

### Responsibility

`main.jsx` is the entry point. It creates the React root and wraps the app with routing and context providers.

### Imports

| Import | Purpose |
| --- | --- |
| `createRoot` | Mounts the React app into the DOM. |
| `./index.css` | Loads global Tailwind CSS import. |
| `App` | Main route/layout component. |
| `LocationContext` | Provides location state and helper functions. |
| `UserContextProvider` | Provides auth state. |
| `BrowserRouter` | Enables client-side routing. |
| `StoreContextProvider` | Provides store/product data. |

### Core logic

```jsx
createRoot(document.getElementById('root')).render(...)
```

The root element comes from `index.html`. Everything rendered inside the provider tree can use route APIs and all three contexts.

## `src/App.jsx`

### Responsibility

`App.jsx` owns the global screen wrapper, navigation, route definitions, and toast rendering.

### Rendered structure

```text
div.h-screen.bg-black.text-white.flex.flex-col
  Nav
  Routes
    /
    /vendor/:vendorId
    /login
    /signup
  ToastContainer
```

### Routes

| Path | Element | Purpose |
| --- | --- | --- |
| `/` | `HomeUI` | Homepage with location prompt, featured products, and all stores. |
| `/vendor/:vendorId` | `Vendor` | Dynamic vendor detail route. |
| `/login` | `Login` | User signin form and API call. |
| `/signup` | `Signup` | User registration form and API call. |

### State

`App.jsx` does not own local state. It delegates state to contexts and pages.

### External UI behavior

`ToastContainer` enables toast notifications from `Login.jsx` and `Signup.jsx`.
