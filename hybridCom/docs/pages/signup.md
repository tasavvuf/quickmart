# Signup page

Source file: `src/pages/Signup.jsx`

Route: `/signup`

Component: `Signup`

## Responsibility

`Signup` collects username, email, and password, calls the FreeAPI registration endpoint, shows toast feedback, and redirects to login after successful signup.

## Imports

| Import | Purpose |
| --- | --- |
| `React` | React namespace import. |
| `useState` | Tracks form fields. |
| `axios` | Makes the signup API request. |
| `toast` | Shows success/error notifications. |
| `useNavigate` | Redirects after signup success. |

## Local state

| State | Initial value | Responsibility |
| --- | --- | --- |
| `email` | `""` | Controlled email input. |
| `password` | `""` | Controlled password input. |
| `username` | `""` | Controlled username input. |

## Function: `signupapicall`

### Responsibility

Validates required fields, sends the registration request, and handles success/failure feedback.

### Validation

If `email`, `password`, or `username` is missing:

- Shows `toast.error("Please fill all fields")`.
- Stops before calling the API.

### API request

Endpoint:

```text
https://api.freeapi.app/api/v1/users/register
```

Method:

```text
POST
```

Request body:

```js
{
  email,
  password,
  username
}
```

### Success behavior

When `responce.data.success` is truthy:

1. Shows `toast.success("Signup successful!")`.
2. Navigates to `/login`.

### Failure behavior

| Failure type | Toast behavior |
| --- | --- |
| API returns success false | Shows response message or `"Signup failed"`. |
| Request throws | Shows `"An error occurred during signup"`. |

## Rendered form

Fields:

- Username text input.
- Email text input.
- Password input.
- Signup submit button.

The form prevents default submit behavior, and the button calls `signupapicall`.

## Notes for future changes

- Rename `signupapicall` to `signUpApiCall` for conventional camelCase.
- Rename `responce` to `response`.
- The catch block currently hides detailed API error messages. It could mirror the login page's more specific error handling.
- Consider using `type="email"` for the email input.
