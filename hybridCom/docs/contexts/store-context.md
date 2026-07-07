# Store context

Source file: `src/context/StoreContext.jsx`

Exported context: `StoreContext`

Exported provider: `StoreContextProvider`

## Responsibility

`StoreContextProvider` owns store and product data for the app. It initializes stores from local seed data and exposes the list to pages.

## Imports

| Import | Purpose |
| --- | --- |
| `createContext` | Creates the context object. |
| `useState` | Stores the current store list and optional selected store. |
| `stores as fakeStores` | Local seed data from `src/data/stores.js`. |

## State

| State | Initial value | Responsibility |
| --- | --- | --- |
| `stores` | `fakeStores` | Main store/product list used by home and vendor pages. |
| `selectedStore` | `null` | Placeholder for a selected store. It is exposed but not actively used by current pages. |

## Provided values

| Value | Type | Responsibility |
| --- | --- | --- |
| `stores` | array | Current store list. |
| `setStores` | function | Replaces or updates store list. |
| `selectedStore` | object or `null` | Optional selected store. |
| `setSelectedStore` | function | Updates selected store. |

## Consumers

| Consumer | Usage |
| --- | --- |
| `HomeUI.jsx` | Reads all stores for featured products and store cards. |
| `Vendor.jsx` | Finds one store by route param and lists that store's products. |

## Core logic

```jsx
const [stores, setStores] = useState(fakeStores);
```

The app currently uses static seed data. If a backend is added later, this context is the natural place to load, cache, and update store records.

## Notes for future changes

- `selectedStore` is available for future flows such as quick views, edit forms, or cart/vendor selection.
- If async loading is added, this context should probably add `isLoading` and `error` states.
- If store/product mutations are added, prefer helper functions like `updateStore`, `addProduct`, or `removeProduct` instead of exposing only raw setters.
