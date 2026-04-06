# Paragon Engine API Documentation

## Endpoint

POST `/paragon/execute`

## Payload (ParagonPayload)

- `action`: 'defineSchema' | 'validate' | 'grade' | 'schemas' (required)
- `name`: string (for defineSchema)
- `fields`: object (for defineSchema)
- `schema`: string (for validate/grade)
- `record`: object (for validate/grade)

## Example Requests

### Define Schema

```json
{
  "action": "defineSchema",
  "name": "User",
  "fields": { "email": { "type": "string", "required": true } }
}
```

### Validate Record

```json
{
  "action": "validate",
  "schema": "User",
  "record": { "email": "test@example.com" }
}
```

## Response (ParagonResult)

- `status`: 'success' | 'error'
- `engine`: 'Paragon'
- `schema`, `fields`, `error`, etc. as appropriate

## Error Example

```json
{ "ok": false, "error": "Invalid request body" }
```

---

# Usage

- Use the `action` field to select the operation.
- See frontend ParagonPage for UI usage example.
