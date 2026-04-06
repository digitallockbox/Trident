# Sovereign API Authentication Spec

## Required Headers

- `x-api-key`: string (tenant/app secret)
- `x-solana-publickey`: string (base58 Solana wallet)
- `x-solana-signature`: string (base58 signature)
- `x-solana-message`: string (JSON, see below)

## Message Schema (`x-solana-message`)

```
{
  "nonce": "<uuid>",
  "timestamp": <ms since epoch>,
  "action": "<engine:operation>",
  "payload": { ... }
}
```

- `nonce`: unique per request (replay protection)
- `timestamp`: ms since epoch; reject if >5min old
- `action`: e.g. "omega:payout", "apex:split"
- `payload`: engine-specific data

## Error Codes

- `401 Unauthorized`: missing/invalid headers, signature, nonce, timestamp, or replay
- `403 Forbidden`: invalid or inactive API key
- `400 Bad Request`: malformed message or payload

## Example Request

```
POST /api/omega/payout
x-api-key: HOSPITAL_API_KEY
x-solana-publickey: 7Q2...abc
x-solana-signature: 5kF...xyz
x-solana-message: {"nonce":"123e4567-e89b-12d3-a456-426614174000","timestamp":1711740000000,"action":"omega:payout","payload":{"amount":1000,"to":"7Q2...abc"}}
Content-Type: application/json

{"amount":1000,"to":"7Q2...abc"}
```

## Integrator Guidance

- Always generate a new `nonce` (UUID) for each request.
- Use current time for `timestamp`.
- Sign the exact `x-solana-message` string with the wallet's private key.
- Never reuse a nonce.
- If you receive 401/403, check your headers, signature, and API key.

---

This contract is canonical. All integrators must follow it for access to sovereign engine APIs.
