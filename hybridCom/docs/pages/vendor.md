# Vendor page

Source file: `src/pages/Vendor.jsx`

Route: `/vendor/:vendorId`

Component: `Vendor`

## Responsibility

`Vendor` shows one store's profile information and product list based on the dynamic `vendorId` route parameter.

## Imports

| Import | Purpose |
| --- | --- |
| `useContext` | Reads store and location contexts. |
| `useParams` | Reads `vendorId` from the URL. |
| `StoreContext` | Provides store/product data. |
| `LocationDataContext` | Provides user coordinates and distance helper. |

## Context usage

From `StoreContext`:

| Value | Usage |
| --- | --- |
| `stores` | Finds the selected vendor and its products. |

From `LocationDataContext`:

| Value | Usage |
| --- | --- |
| `lat` | User latitude for distance calculation. |
| `lng` | User longitude for distance calculation. |
| `calculateDistance` | Calculates distance to selected vendor. |

## Route params

```jsx
const { vendorId } = useParams();
```

`vendorId` is matched against `store.id` values from `src/data/stores.js`.

## Derived values

### `vendorProducts`

```jsx
const vendorProducts = stores
  .filter((store) => store.id === vendorId)
  .flatMap((store) => store.products);
```

Responsibility:

- Find matching store records.
- Flatten their products into a product array.
- Return an empty array when no store matches.

### `vendor`

```jsx
const vendor = stores.find((store) => store.id === vendorId);
```

Responsibility:

- Finds the first matching store.
- Supplies banner, logo, name, category, rating, status, and location details.

### `distance`

```jsx
const distance =
  vendor?.location && lat && lng
    ? calculateDistance(lat, lng, vendor.location.lat, vendor.location.lng)
    : null;
```

Responsibility:

- Calculates user-to-vendor distance only when the vendor has a location and user coordinates exist.
- Returns `null` when distance cannot be shown.

## Render sections

### Banner and logo

Displays:

- Vendor banner when `vendor?.banner` exists.
- Circular vendor logo overlay when `vendor?.logo` exists.

### Vendor information

Displays:

- Store name, or `vendorId` fallback if no store is found.
- Category badge.
- Rating and review count.
- Open status only when `vendor?.isOpen` is truthy.
- City and address.
- Distance and delivery estimate if location is available.
- "Fetch location to see distance" if distance is unavailable.

### Empty product state

If `vendorProducts.length === 0`, the page shows:

```text
No products found for this vendor.
```

### Product grid

Each product card displays:

- Product image.
- Product name.
- Product price.

## UI states

| State | Behavior |
| --- | --- |
| Valid `vendorId` | Shows vendor profile and products. |
| Unknown `vendorId` | Shows `vendorId` as heading and "No products found for this vendor." |
| Location fetched | Shows distance and delivery estimate. |
| Location missing | Shows "Fetch location to see distance". |
| Vendor closed | No closed badge is currently shown because the open status block renders only for `vendor?.isOpen`. |

## Core delivery logic

```js
Math.round(distance * 5)
```

This estimates delivery time as 5 minutes per km.

## Notes for future changes

- Add an explicit "Closed" badge if closed vendors should be visible on the detail page.
- Current distance checks use truthy values. A distance of `0` would be treated as missing.
- The page handles unknown vendors without crashing, but a dedicated 404-style UI would be clearer.
