# Local Ecom

Local Ecom is a React + Vite storefront prototype for browsing nearby stores, featured products, and vendor inventory. It uses browser geolocation to estimate distance and delivery time for Rajkot-based demo stores, and it includes login/signup flows backed by the FreeAPI user endpoints.

## What is included

- Storefront home page with featured products and all-store browsing.
- Store detail page with banner, logo, rating, status, address, products, distance, and delivery estimate.
- Browser geolocation support for location-aware delivery messaging.
- User auth context for login state, user details, access token, and refresh token.
- Store context backed by local seed data in `src/data/stores.js`.
- Toast notifications for auth success and error states.

## Tech stack

- React 19
- Vite 8
- React Router 7
- Axios
- React Toastify
- Tailwind-style utility classes through the app stylesheet setup

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
```

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

## App routes

- `/` shows the location prompt, featured products, and all stores.
- `/vendor/:vendorId` shows one store and its products.
- `/login` signs in a user and stores returned tokens in local storage.
- `/signup` creates a user and redirects to login on success.

## Data and state

`StoreContext` loads local demo stores from `src/data/stores.js`. Each store includes profile media, category, location, open status, reviews, delivery radius, and products.

`LocationContext` owns geolocation state and distance calculation. The UI only shows distance and delivery estimates after the user allows location access.

`UserContext` owns the logged-in user, auth status, access token, and refresh token. The navbar uses it to hide auth links after login.

## Auth API

Signup posts to:

```text
https://api.freeapi.app/api/v1/users/register
```

Login posts to:

```text
https://api.freeapi.app/api/v1/users/login
```

Successful login persists `accessToken` and `refreshToken` in `localStorage` and updates the in-memory user context.
