# Local Ecom

Local Ecom is a React + Vite storefront prototype for browsing nearby Rajkot stores, featured products, vendor inventory, and auth flows. The app uses local seed data for stores/products, browser geolocation for distance and delivery estimates, and FreeAPI endpoints for signup/login.

This README is the main map. Every component, context, page, data module, important state value, function, and responsibility is documented in separate linked files under `docs/`.

## Documentation index

### Architecture and app flow

- [Project architecture](docs/architecture.md)
- [Application shell: `src/main.jsx` and `src/App.jsx`](docs/app-shell.md)

### Context documentation

- [Location context](docs/contexts/location-context.md)
- [Store context](docs/contexts/store-context.md)
- [User context](docs/contexts/user-context.md)

### Page documentation

- [Home page: `HomeUI.jsx`](docs/pages/home-ui.md)
- [Vendor page: `Vendor.jsx`](docs/pages/vendor.md)
- [Login page: `Login.jsx`](docs/pages/login.md)
- [Signup page: `Signup.jsx`](docs/pages/signup.md)

### Component documentation

- [Navbar component: `Nav.jsx`](docs/components/nav.md)

### Data documentation

- [Store seed data: `stores.js`](docs/data/stores.md)

## Tech stack

- React 19
- Vite 8
- React Router 7
- Axios
- React Toastify
- Utility-first styling classes with the global CSS import in `src/index.css`

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Main routes

| Route | Page | Responsibility |
| --- | --- | --- |
| `/` | [`HomeUI`](docs/pages/home-ui.md) | Shows location prompt, featured products, store cards, distance, and delivery messages. |
| `/vendor/:vendorId` | [`Vendor`](docs/pages/vendor.md) | Shows one vendor profile and that vendor's products. |
| `/login` | [`Login`](docs/pages/login.md) | Authenticates a user, stores tokens, updates `UserContext`, and redirects home. |
| `/signup` | [`Signup`](docs/pages/signup.md) | Registers a user and redirects to login on success. |

## State ownership summary

| Area | Owner | What it stores or computes |
| --- | --- | --- |
| User authentication | [`UserContext`](docs/contexts/user-context.md) | `user`, `isLoggedIn`, `accessToken`, `refreshToken`, plus setters for each. |
| Store data | [`StoreContext`](docs/contexts/store-context.md) | Local store list from `src/data/stores.js` and optional `selectedStore`. |
| Location data | [`LocationContext`](docs/contexts/location-context.md) | User latitude, longitude, status message, geolocation fetch, and distance calculation. |
| Routing and layout | [`App`](docs/app-shell.md) | Global nav, route table, and toast container. |

## API endpoints

Signup posts to:

```text
https://api.freeapi.app/api/v1/users/register
```

Login posts to:

```text
https://api.freeapi.app/api/v1/users/login
```

Successful login stores `accessToken` and `refreshToken` in `localStorage`, then updates the in-memory auth context.

## Project structure

```text
src/
  components/
    Nav.jsx
  context/
    LocationContext.jsx
    StoreContext.jsx
    UserContext.jsx
  data/
    stores.js
  pages/
    HomeUI.jsx
    Login.jsx
    Signup.jsx
    Vendor.jsx
  App.jsx
  main.jsx
```

```text
docs/
  app-shell.md
  architecture.md
  components/
    nav.md
  contexts/
    location-context.md
    store-context.md
    user-context.md
  data/
    stores.md
  pages/
    home-ui.md
    login.md
    signup.md
    vendor.md
```
