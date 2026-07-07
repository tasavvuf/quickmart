# Store seed data

Source file: `src/data/stores.js`

Export: `stores`

## Responsibility

`stores.js` is the local seed database for the storefront. It provides all stores, vendor profile media, coordinates, ratings, status, and products used by the UI.

## Store object shape

```js
{
  id,
  name,
  category,
  banner,
  logo,
  location,
  deliveryRadius,
  rating,
  totalReviews,
  isOpen,
  products
}
```

## Store fields

| Field | Type | Responsibility |
| --- | --- | --- |
| `id` | string | Unique route id. Used in `/vendor/:vendorId`. |
| `name` | string | Display name for store cards and vendor detail. |
| `category` | string | Store category badge. |
| `banner` | string | Vendor detail banner image URL. |
| `logo` | string | Store card and vendor logo image URL. |
| `location` | object | City, address, latitude, and longitude. |
| `deliveryRadius` | number | Declared delivery radius in km. Currently stored but not used in UI logic. |
| `rating` | number | Displayed on home and vendor pages. |
| `totalReviews` | number | Displayed with rating. |
| `isOpen` | boolean | Controls open/closed badge on home page. |
| `products` | array | Products sold by the store. |

## Location object shape

```js
{
  city,
  address,
  lat,
  lng
}
```

## Product object shape

```js
{
  id,
  name,
  price,
  image,
  featured,
  stock,
  category
}
```

## Product fields

| Field | Type | Responsibility |
| --- | --- | --- |
| `id` | string | Unique product id for React keys. |
| `name` | string | Product card title. |
| `price` | number | Product price shown in rupees. |
| `image` | string | Product image URL. |
| `featured` | boolean | Controls whether product appears in the homepage featured section. |
| `stock` | number | Available inventory count. Currently stored but not displayed. |
| `category` | string | Product category. Currently stored but not displayed. |

## Current stores

| ID | Name | Category | Products | Open |
| --- | --- | --- | --- | --- |
| `store-101` | Fresh Mart | Grocery | 3 | Yes |
| `store-202` | Tech Hub | Electronics | 2 | Yes |
| `store-303` | Green Valley Farms | Organic | 2 | Yes |
| `store-404` | Style Studio | Fashion | 2 | Yes |
| `store-505` | Home Essentials | Home Decor | 2 | No |
| `store-606` | Sports Zone | Sports | 2 | Yes |
| `store-707` | Book Haven | Books | 2 | Yes |
| `store-808` | Pet Paradise | Pets | 2 | Yes |

## UI consumers

| Consumer | Usage |
| --- | --- |
| `StoreContextProvider` | Loads the full array into context state. |
| `HomeUI.jsx` | Shows featured products and all stores. |
| `Vendor.jsx` | Finds a vendor by `id` and renders its products. |

## Notes for future changes

- Keep `id` stable because route links depend on it.
- Add `featured: true` to a product when it should appear on the homepage.
- `deliveryRadius`, `stock`, and product `category` are ready for future filtering/availability features.
