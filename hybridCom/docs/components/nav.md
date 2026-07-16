# Navbar component

Source file: `src/components/Nav.jsx`

Component: `Nav`

## Responsibility

`Nav` renders the app title link, auth navigation buttons, and the profile entry point. It reacts to authentication state from `UserContext`.

## Imports

| Import | Purpose |
| --- | --- |
| `useContext` | Reads context state. |
| `Link` | Navigates without a full page reload. |
| `UserContext` | Provides `isLoggedIn` and `user`. |
| `User` | Fallback profile icon from `lucide-react`. |

## Context usage

```jsx
const { isLoggedIn, user } = useContext(UserContext);
```

`isLoggedIn` controls whether auth links or the profile button are visible.

## Rendered UI

| Element | Behavior |
| --- | --- |
| `Local Ecom` heading | Wrapped in a `Link` to `/`. |
| Login button | Links to `/login`; only shown when `isLoggedIn` is false. |
| Signup button | Links to `/signup`; only shown when `isLoggedIn` is false. |
| Profile button | Links to `/user`; shows the avatar, first username character, or fallback user icon. |

## UI states

| State | Output |
| --- | --- |
| `isLoggedIn === false` | Shows login and signup buttons. |
| `isLoggedIn === true` | Shows the profile button and hides login/signup buttons. |

## Notes for future changes

- There is no logout button yet.
- The profile button uses the same avatar fallback pattern as the user page.
- If persistent auth is added, this component will automatically respond as long as `UserContext` updates `isLoggedIn`.
