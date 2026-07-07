# Location context

Source file: `src/context/LocationContext.jsx`

Exported context: `LocationDataContext`

Default export: `LocationContext`

## Responsibility

`LocationContext` owns browser geolocation state and distance calculation. It lets pages fetch the user's current location, read the result, display a status message, and calculate distance from the user to a store.

## State

| State | Initial value | Meaning |
| --- | --- | --- |
| `lat` | `null` | User latitude after geolocation succeeds. |
| `lng` | `null` | User longitude after geolocation succeeds. |
| `message` | `"Location is not fetched yet !!!"` | User-facing geolocation status. |

## Provided values

| Value | Type | Responsibility |
| --- | --- | --- |
| `getUserLocation` | function | Calls `navigator.geolocation.getCurrentPosition`. |
| `message` | string | Current location status message. |
| `setMessage` | function | Allows consumers to update the message. |
| `lat` | number or `null` | Current user latitude. |
| `setLat` | function | Allows consumers to update latitude. |
| `lng` | number or `null` | Current user longitude. |
| `setLng` | function | Allows consumers to update longitude. |
| `calculateDistance` | function | Calculates kilometer distance between two coordinate pairs. |

## Functions

### `calculateDistance(lat1, lon1, lat2, lon2)`

Uses the Haversine formula to calculate distance between two latitude/longitude pairs.

Core steps:

1. Uses Earth radius `6371` km.
2. Converts latitude and longitude differences from degrees to radians.
3. Computes the Haversine `a` value.
4. Computes angular distance `c`.
5. Returns `R * c` rounded to 2 decimal places as a `Number`.

Return example:

```js
3.42
```

### `getUserLocation()`

Calls the browser Geolocation API.

Success behavior:

- Reads `position.coords.latitude`.
- Reads `position.coords.longitude`.
- Updates `lat`.
- Updates `lng`.
- Updates `message` with both coordinates.

Error behavior:

- If permission is denied, message becomes `"User denied the request for Geolocation."`.
- For other geolocation errors, message becomes `"Something went wrong while getting location."`.

## Consumers

| Consumer | Usage |
| --- | --- |
| `HomeUI.jsx` | Fetches location, shows message/coordinates, calculates distance for every store. |
| `Vendor.jsx` | Calculates distance from user to selected vendor. |

## UI states driven by this context

| State | User experience |
| --- | --- |
| `lat` and `lng` are `null` | Pages show prompts such as "Fetch location to see distance". |
| `lat` and `lng` are available | Distance and delivery time appear. |
| Permission denied | Location section shows a denial message. |
| Other error | Location section shows a generic location error. |

## Notes for future changes

- Check for `navigator.geolocation` support before calling it if browser compatibility becomes important.
- The distance formula is reusable and currently belongs in context because both home and vendor pages need it.
- The app currently uses truthy checks for `lat`, `lng`, and `distance`; exact `0` values would be treated as missing in some UI branches.
