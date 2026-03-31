# Registration Update Guide

## What changed

- `POST /auth/signup` now accepts only `email`, `password` and optional `referral_code`.
- A successful signup logs the user in immediately in the same session.
- If the email already exists, signup updates the user's password with the new one and logs the user in.
- Profile fields such as `name`, `phone_number`, `gender`, `birth_date`, `country`, `city`, `biography` and `status` should now be completed later with `PATCH /auth/me`.

## New signup payload

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "referral_code": "optional-code"
}
```

## Profile completion

After signup, send profile data with `PATCH /auth/me`.

```json
{
  "name": "John Doe",
  "phone_number": "+243000000000",
  "gender": "male",
  "birth_date": "1995-01-01",
  "country": "DRC",
  "city": "Lubumbashi",
  "biography": "Entrepreneur tech",
  "status": "entrepreneur"
}
```

## Frontend impact

- Remove profile fields from the registration form.
- Keep only email and password at signup.
- Redirect the user to profile completion after signup if more information is required.
- Treat signup as authenticated success because the session is opened automatically.
