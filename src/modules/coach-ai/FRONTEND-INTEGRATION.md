## Frontend integration guide

### Admin screens

- `GET /coach-ai` lists all configured coaches.
- `POST /coach-ai` creates a coach with `name`, `profile`, `role`, `expected_outputs`, optional `model`, and optional `status`.
- `PATCH /coach-ai/:coachId` updates a coach.
- `DELETE /coach-ai/:coachId` deletes a coach.

Example payload:

```json
{
  "name": "Coach stratégie",
  "profile": "Expert en validation marché pour startups early-stage.",
  "role": "Diagnostic venture",
  "expected_outputs": ["DIAGNOSTIC", "CLARIFICATION"],
  "model": "llama3.2:3b",
  "status": "active"
}
```

### User flow

1. Load the user ventures from the existing venture endpoints.
2. After a venture is selected, call `GET /coach-ai/ventures/:ventureId/coaches`.
3. When a coach is selected, optionally call `GET /coach-ai/ventures/:ventureId/coaches/:coachId/conversation` to restore an existing thread.
4. Send messages with `POST /coach-ai/ventures/:ventureId/coaches/:coachId/chat`.

Chat payload:

```json
{
  "message": "Aide-moi à clarifier ma proposition de valeur."
}
```

Chat response:

```json
{
  "type": "CLARIFICATION",
  "title": "Clarification de l'offre",
  "summary": "Résumé ciblé sur la venture.",
  "bullets": ["Point 1", "Point 2"],
  "ventureFocus": "Référence explicite à la venture",
  "scopeCheck": {
    "profile": "Expert en validation marché pour startups early-stage.",
    "role": "Diagnostic venture",
    "grounded": true
  }
}
```

### UI recommendations

- Render coach responses from `title`, `summary`, and `bullets` instead of printing raw JSON.
- Use `type` to style the response card and to branch the frontend display.
- Block free-form rendering if `scopeCheck.grounded` is false or if the API rejects the response.
- Keep the selected venture id in route state or query params so the discussion always stays venture-scoped.
