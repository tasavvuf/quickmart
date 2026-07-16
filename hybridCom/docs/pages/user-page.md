# User page

Source file: `src/pages/UserPage.jsx`

Route: `/user`

## Responsibility

`UserPage` displays the current user's profile details from `UserContext` and allows frontend-only edits to basic profile fields.

## Editable fields

| Field | Behavior |
| --- | --- |
| `username` | Editable after clicking the edit button. |
| `email` | Editable after clicking the edit button. |
| `phone` | Editable after clicking the edit button. |
| `dob` | Editable with a date input after clicking the edit button. |

## Read-only fields

| Field | Behavior |
| --- | --- |
| `avatar` | Shows the avatar image when present, otherwise the first username character. |
| `address` | Shows address lines from the user object. |

## Notes

- Save writes the edited fields back into `UserContext`.
- Cancel restores the form from the current context user.
- Address does not include latitude or longitude because location coordinates already live in `LocationContext`.
