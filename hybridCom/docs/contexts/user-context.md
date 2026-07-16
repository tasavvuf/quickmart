# User context

Source file: `src/context/UserContext.jsx`

Exported context: `UserContext`

Exported provider: `UserContextProvider`

## Responsibility

`UserContextProvider` owns the in-memory authentication state and current user profile used by the navbar, login page, and profile page.

## State

| State | Initial value | Responsibility |
| --- | --- | --- |
| `user` | Dummy frontend user | Logged-in user profile details. |
| `isLoggedIn` | `true` | Whether the current session is authenticated in memory. |
| `accessToken` | `null` | API access token after login. |
| `refreshToken` | `null` | API refresh token after login. |

## Provided values

| Value | Type | Responsibility |
| --- | --- | --- |
| `user` | object or `null` | Current user profile. |
| `setUser` | function | Updates user profile. |
| `isLoggedIn` | boolean | Controls authenticated UI. |
| `setIsLoggedIn` | function | Updates logged-in state. |
| `accessToken` | string or `null` | In-memory access token. |
| `setAccessToken` | function | Updates access token. |
| `refreshToken` | string or `null` | In-memory refresh token. |
| `setRefreshToken` | function | Updates refresh token. |

## Consumers

| Consumer | Usage |
| --- | --- |
| `Nav.jsx` | Reads `isLoggedIn` to hide login/signup links after login. |
| `Login.jsx` | Writes login status, tokens, and user object after successful signin. |
| `UserPage.jsx` | Reads and updates editable user profile fields. |

## User object shape set by login

```js
{
  username,
  email,
  phone,
  dob,
  role,
  id,
  avatar,
  address: {
    label,
    line1,
    line2,
    city,
    state,
    pincode
  }
}
```

`avatar` is set from `response.data.data.user.avatar?.url || null`.

## Important behavior

- Tokens are stored in both context and `localStorage` by `Login.jsx`.
- The provider currently starts with dummy frontend-only user data and `isLoggedIn` set to `true`.
- The provider does not currently read existing tokens from `localStorage` on page load.

## Notes for future changes

- Add hydration from `localStorage` if the app should remember logged-in state after refresh.
- Add a logout helper if the navbar or profile page should clear tokens and user state.
- Consider centralizing auth API calls in a service file if more auth actions are added.
