# Login page

Source file: `src/pages/Login.jsx`

Route: `/login`

Component: `Login`

## Responsibility

`Login` collects username/password, calls the FreeAPI login endpoint, stores returned tokens, updates `UserContext`, shows toast feedback, and redirects home after successful login.

## Imports

| Import | Purpose |
| --- | --- |
| `useNavigate` | Redirects after login. |
| `axios` | Makes the login API request. |
| `useState` | Tracks form fields. |
| `useContext` | Writes auth context state. |
| `toast` | Shows success/error notifications. |
| `UserContext` | Provides auth setters. |

## Local state

| State | Initial value | Responsibility |
| --- | --- | --- |
| `username` | `""` | Controlled username input. |
| `password` | `""` | Controlled password input. |

## Context setters

From `UserContext`:

| Setter | Usage |
| --- | --- |
| `setIsLoggedIn` | Sets logged-in state to `true` after success. |
| `setAccessToken` | Stores access token in memory. |
| `setRefreshToken` | Stores refresh token in memory. |
| `setUser` | Stores user profile details in memory. |

## Function: `signinapicall`

### Responsibility

Validates required fields, sends login request, handles success and failure states.

### Validation

If `username` or `password` is missing:

- Shows `toast.error("Please fill all fields")`.
- Stops before calling the API.

### API request

Endpoint:

```text
https://api.freeapi.app/api/v1/users/login
```

Method:

```text
POST
```

Request body:

```js
{
  username,
  password
}
```

Headers:

```js
{
  "Content-Type": "application/json"
}
```

### Success behavior

When `response.data.success` is truthy:

1. Shows `toast.success("Login successful")`.
2. Saves `accessToken` to `localStorage`.
3. Saves `refreshToken` to `localStorage`.
4. Sets `isLoggedIn` to `true`.
5. Writes tokens to `UserContext`.
6. Builds and stores the user object.
7. Redirects to `/` with `{ replace: true }`.

### User object stored in context

```js
{
  username: response.data.data.username,
  email: response.data.data.email,
  role: response.data.data.role,
  id: response.data.data.user._id,
  avatar: response.data.data.user.avatar?.url || null
}
```

### Failure behavior

| Failure type | Toast behavior |
| --- | --- |
| API returns success false | Shows response message or `"Login failed"`. |
| Server response error | Shows response message or HTTP status. |
| Network error | Shows `"Network error. Please check your connection."`. |
| Other error | Shows error message or `"Login failed"`. |

## Rendered form

Fields:

- Username text input.
- Password input.
- Login submit button.

The form prevents default submit behavior, and the button calls `signinapicall`.

## Notes for future changes

- Rename `signinapicall` to `signInApiCall` for conventional camelCase.
- The app stores tokens in `localStorage`, but `UserContext` does not hydrate from them on refresh yet.
- Consider disabling the button while the request is pending to prevent duplicate submissions.
