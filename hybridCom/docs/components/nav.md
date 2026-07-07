# Navbar component

Source file: `src/components/Nav.jsx`

Component: `Nav`

## Responsibility

`Nav` renders the app title link and auth navigation buttons. It reacts to authentication state from `UserContext`.

## Imports

| Import | Purpose |
| --- | --- |
| `useContext` | Reads context state. |
| `Link` | Navigates without a full page reload. |
| `UserContext` | Provides `isLoggedIn`. |

## Context usage

```jsx
const { isLoggedIn } = useContext(UserContext);
```

`isLoggedIn` controls whether the auth links are visible.

## Rendered UI

| Element | Behavior |
| --- | --- |
| `Local Ecom` heading | Wrapped in a `Link` to `/`. |
| Login button | Links to `/login`; only shown when `isLoggedIn` is false. |
| Signup button | Links to `/signup`; only shown when `isLoggedIn` is false. |

## UI states

| State | Output |
| --- | --- |
| `isLoggedIn === false` | Shows login and signup buttons. |
| `isLoggedIn === true` | Hides login and signup buttons. |

## Notes for future changes

- There is no logout button yet.
- There is no profile/user display yet.
- If persistent auth is added, this component will automatically respond as long as `UserContext` updates `isLoggedIn`.
