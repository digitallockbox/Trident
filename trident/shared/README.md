# @trident/shared

Shared TypeScript types and utilities for the Trident platform frontend and backend.

## Purpose

This package defines the data contracts between frontend and backend, ensuring type safety across your entire application stack. When the backend returns a `User` object, the frontend knows exactly what fields to expect, reducing runtime errors and keeping the system consistent.

## Structure

```
shared/
├── src/types/
│   ├── user.ts       # User and UserProfile types
│   ├── payout.ts     # Payout, PayoutStatus, and ClaimResponse types
│   ├── cycle.ts      # Cycle and CycleStatus types
│   ├── webhook.ts    # Helius webhook and FraudEvent types
│   └── index.ts      # Entry point, re-exports all types
├── package.json
└── tsconfig.json
```

## Type Categories

### User Types

- `User`: Core user entity with wallet, tier, score, timestamps
- `UserProfile`: Extended user data with computed fields (totalPayouts, pendingClaims, reputationScore)

### Payout Types

- `Payout`: Individual reward transaction record
- `PayoutStatus`: Enum for payout states (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
- `ClaimPayload`: Request payload for POST /claim
- `ClaimResponse`: Response after successful claim operation

### Cycle Types

- `Cycle`: Rewards distribution period (cycleNumber, startsAt, endsAt, closed)
- `CycleStatus`: Current and upcoming cycle summary

### Webhook Types

- `WebhookEventType`: Event categories (TRANSACTION, TOKEN_TRANSFER, FRAUD, ERROR)
- `HeliusWebhookPayload`: Structure of incoming Helius webhooks
- `FraudEvent`: Suspicious activity record
- `WebhookResponse`: Webhook processing response

## Usage

### Frontend

```typescript
import { UserProfile, Payout, ClaimResponse } from "@shared/types";
import { apiClient, API_ROUTES } from "../utils/apiClient";

// Load typed user data
const user = await apiClient.getJson<UserProfile>(API_ROUTES.profile);

// Type-safe claim
const claimResponse = await apiClient.post(API_ROUTES.claim);
```

### Backend

```typescript
import { User, UserProfile, Payout } from "@shared/types";

// Define route handlers with shared types
router.get("/profile", (req, res) => {
  const userProfile: UserProfile = {
    id: user.id,
    wallet: user.wallet,
    tier: user.tier,
    score: user.score,
    totalPayouts: 42,
    pendingClaims: 3,
    reputationScore: 950,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
  res.json(userProfile);
});
```

## Type Safety

The `as const` assertion on API routes ensures route names can't be misspelled:

```typescript
// In apiRoutes.ts
export const API_ROUTES = {
  profile: "/profile",
  claim: "/claim",
  // ...
} as const;

// In components
apiClient.getJson<UserProfile>(API_ROUTES.profile); // ✓ Type-safe
apiClient.getJson<UserProfile>("typo-route"); // ✚ String literal, lose type safety
```

## Environment Configuration

Base URL comes from `VITE_API_URL` environment variable:

- **Development**: `http://localhost:4000`
- **Staging**: `https://staging-api.trident.com`
- **Production**: `https://api.trident.com`

The `apiClient` automatically includes `credentials: 'include'` on all requests for session preservation.

## Path Aliases

Both frontend and backend use the `@shared/*` path alias for cleaner imports:

```typescript
// Both of these work:
import { UserProfile } from "@shared/types";
import { UserProfile } from "../../../shared/src/types";

// Use the alias for consistency
import { UserProfile } from "@shared/types";
```

## Development

Check types without emitting code:

```bash
npm run typecheck
```

## Integration with Reverse Proxy

When deployed behind Nginx, both frontend and backend share a single domain:

```nginx
location /api/ {
  proxy_pass http://backend:4000/;
}

location / {
  root /usr/share/nginx/html;
  try_files $uri /index.html;
}
```

The `apiClient` automatically prefixes calls based on `VITE_API_URL`, so no code changes needed.
