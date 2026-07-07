# Project architecture

## Purpose

The app is a local ecommerce storefront prototype. It lets users browse stores and products, fetch their browser location, see distance/delivery estimates, open vendor detail pages, and complete signup/login flows.

## Runtime flow

1. `src/main.jsx` mounts React into `#root`.
2. `BrowserRouter` enables route matching and links.
3. `LocationContext` provides geolocation state and distance helpers.
4. `StoreContextProvider` provides local store/product data.
5. `UserContextProvider` provides auth state.
6. `App.jsx` renders the global navbar, route table, and toast container.
7. Pages consume the contexts they need.

## Provider nesting

```text
BrowserRouter
  LocationContext
    StoreContextProvider
      UserContextProvider
        App
```

This means every page and component inside `App` can use:

- `LocationDataContext`
- `StoreContext`
- `UserContext`
- React Router APIs such as `Link`, `Routes`, `Route`, `useNavigate`, and `useParams`

## Data flow

| Source | Consumer | Flow |
| --- | --- | --- |
| `src/data/stores.js` | `StoreContextProvider` | Seed data is loaded into `stores` state. |
| `StoreContext` | `HomeUI`, `Vendor` | Pages read stores and products for listings/detail views. |
| Browser Geolocation API | `LocationContext` | `getUserLocation` writes `lat`, `lng`, and `message`. |
| `LocationContext` | `HomeUI`, `Vendor` | Pages compute distances and delivery estimates. |
| FreeAPI auth endpoints | `Login`, `Signup` | Signup creates an account. Login returns tokens and user details. |
| `UserContext` | `Nav`, `Login` | Login updates auth state. Navbar hides auth links when logged in. |

## Rendering model

The app is client-side rendered through Vite. Most visual styling is written directly as utility classes in JSX. `src/index.css` contains the global `@import "tailwindcss";` stylesheet entry.

## Important behavior rules

- Distance UI only appears after `lat` and `lng` are available.
- Delivery time is estimated as `distance * 5` minutes.
- Stores/products come from local seed data, not from an external backend.
- Login persists tokens to `localStorage`, but context state starts as logged out on page refresh because the provider does not hydrate from `localStorage` yet.
- Toast messages require the global `ToastContainer` in `App.jsx`.
