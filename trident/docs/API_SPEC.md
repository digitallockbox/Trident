# API Spec: Omega Engine

## POST /api/omega/payout

Request:

- Headers: (see AUTH_SPEC.md for auth)
- Body:
  ```json
  {
  	"wallet": "<base58 Solana address>",
  	"amount": <number>,
  	"token": "<base58 token mint, optional>"
  }
  ```

Response:

- 200:
  ```json
  {
    "ok": true,
    "tx": "<transaction signature>"
  }
  ```
- 400: `{ "error": string }`

---

This endpoint creates a payout request for the specified wallet and tenant. Requires hybrid authentication. The request and response follow the `PayoutRequest` and `PayoutResponse` schema in `models/payout.ts`.
