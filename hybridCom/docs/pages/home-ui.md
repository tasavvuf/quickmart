# Home page

Source file: `src/pages/HomeUI.jsx`

Route: `/`

Component: `HomeUI`

## Responsibility

`HomeUI` is the storefront homepage. It lets the user fetch their location, shows featured products from all stores, and shows all stores with rating, open status, product count, distance, and delivery messaging.

## Imports

| Import | Purpose |
| --- | --- |
| `useContext` | Reads context values. |
| `useMemo` | Memoizes the store distance map. |
| `Link` | Links product/store cards to vendor pages. |
| `LocationDataContext` | Provides location state and distance helper. |
| `StoreContext` | Provides stores and products. |

## Context usage

From `StoreContext`:

| Value | Usage |
| --- | --- |
| `stores` | Source for featured products and all store cards. |

From `LocationDataContext`:

| Value | Usage |
| --- | --- |
| `getUserLocation` | Runs when the user clicks "Fetch Your Location". |
| `message` | Displayed below the location button. |
| `lat` | Used to show current latitude and calculate distances. |
| `lng` | Used to show current longitude and calculate distances. |
| `calculateDistance` | Calculates user-to-store distance. |

## Derived state

### `storeDistances`

`storeDistances` is created with `useMemo`.

```jsx
const storeDistances = useMemo(() => {
  if (!lat || !lng) return {};

  const distanceMap = {};

  for (const store of stores) {
    distanceMap[store.id] = calculateDistance(
      lat,
      lng,
      store.location.lat,
      store.location.lng,
    );
  }

  return distanceMap;
}, [lat, lng, stores]);
```

Responsibility:

- Avoid recomputing all store distances on every render.
- Return an object keyed by store id.
- Keep distance lookup simple while rendering cards.

Shape:

```js
{
  "store-101": 2.14,
  "store-202": 5.9
}
```

## Render sections

### Location section

Shows:

- `Fetch Your Location` button.
- Current `message`.
- Latitude/longitude block if both `lat` and `lng` exist.

Button behavior:

- Calls `getUserLocation`.
- The context handles success and error updates.

### Featured products section

Core logic:

1. Loops through every store with `stores.flatMap`.
2. Filters each store's products to `product.featured`.
3. Renders one product card for each featured product.
4. Uses the parent store id for the vendor link.

Product card displays:

- Product image.
- Product name.
- Fast delivery badge if distance is under 5 km.
- Product price.
- Distance if available.
- "Fetch location to see distance" if distance is unavailable.
- Link to `/vendor/${store.id}`.

### Divider

Separates featured products from the all-stores list.

### All stores section

Core logic:

1. Loops through `stores`.
2. Reads distance from `storeDistances[store.id]`.
3. Renders one store card per store.

Store card displays:

- Store logo.
- Store name.
- Store category.
- Rating and review count.
- Open/closed status.
- Product count.
- Distance if available.
- Delivery estimate if available.
- Link to `/vendor/${store.id}`.

## UI states

| State | Behavior |
| --- | --- |
| Location not fetched | Distance text is replaced with "Fetch location to see distance". |
| Location fetched | Distances and delivery estimates are shown. |
| Distance under 5 km | Featured cards show fast delivery messaging. Store cards show "Fast Delivery". |
| Distance 5 km or more | Cards show estimated delivery time. |

## Core delivery logic

Delivery estimate:

```js
Math.ceil(distance * 5)
```

Vendor page uses `Math.round(distance * 5)`, so home and vendor estimates may differ by rounding.

## Notes for future changes

- `useMemo` depends on `calculateDistance` but does not include it in the dependency list. Since the function is recreated by context on provider render, adding it would be more complete.
- Current distance checks use truthy values. A distance of `0` would render like missing data.
- Product and store cards are repeated JSX patterns. If they grow, split them into dedicated components and link those new docs from the README.
