# Data Consistency & Shared Types Integration

This document explains how Trident uses shared TypeScript types to ensure data consistency between frontend and backend.

## Overview

The `@shared/types` package establishes a **single source of truth** for all data contracts in the system. When the backend returns a user profile, the frontend already knows the exact shape of the response without runtime guessing.

## Architecture

```
Frontend                Shared Types           Backend
┌─────────────┐        ┌──────────────┐       ┌──────────────┐
│ Home.tsx    ├───────▶│ UserProfile  │◀─────▶│ GET /profile │
│ Profile.tsx │        │ Payout       │       │ POST /claim  │
│ apiClient   │        │ Cycle        │       │              │
└─────────────┘        └──────────────┘       └──────────────┘
```

### Type Flow

1. **Backend defines response**: Implements route handler that returns `UserProfile`
2. **Shared exports type**: `@shared/types` exports `UserProfile` interface
3. **Frontend imports type**: Components import `UserProfile` from `@shared/types`
4. **Type safety enforced**: TypeScript ensures frontend matches backend contract

## Example: User Profile Flow

### Backend Implementation

```typescript
// backend/src/routes/profile.ts
import { UserProfile } from "@shared/types";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response<UserProfile>) => {
  const profile: UserProfile = {
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
  res.json(profile);
});

export default router;
```

### Frontend Usage

```typescript
// frontend/src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { UserProfile } from '@shared/types';
import { apiClient, API_ROUTES } from '../utils/apiClient';

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    apiClient
      .getJson<UserProfile>(API_ROUTES.profile)
      .then(setUser)
      .catch(handleError);
  }, []);

  // TypeScript knows exactly what properties user has
  return (
    <div>
      <h1>{user?.wallet}</h1>
      <p>Tier: {user?.tier}</p>
      <p>Score: {user?.score}</p>
      <p>Pending Claims: {user?.pendingClaims}</p>
    </div>
  );
}
```

## Type Safety Benefits

### 1. Compile-Time Errors

```typescript
// ✓ Correct: User has reputationScore property
user.reputationScore;

// ✚ Error: User doesn't have reputation property
user.reputation; // TypeScript error: Property 'reputation' does not exist
```

### 2. Autocomplete in IDE

The IDE knows all available properties and provides intelligent suggestions while typing.

### 3. Breaking Changes Are Detected

If backend adds/removes fields, TypeScript catches mismatches before deployment.

## Adding New Fields

When you need to add a field (like `kyc_status` to users):

1. **Update shared type** in `shared/src/types/user.ts`:

   ```typescript
   export interface User {
     // ... existing fields
     kycStatus?: "pending" | "approved" | "rejected";
   }
   ```

2. **Update backend implementation** to include the field:

   ```typescript
   const profile: UserProfile = {
     // ... existing fields
     kycStatus: user.kycStatus,
   };
   ```

3. **Frontend automatically knows** about the new field (no code needed, just refactor if needed):

   ```typescript
   // Option 1: Optional chaining (backward compatible)
   {user?.kycStatus && <p>KYC Status: {user.kycStatus}</p>}

   // Option 2: Reference in component (TypeScript verifies field exists)
   <KycStatus status={user.kycStatus} />
   ```

## Route Constants Ensure Consistency

The `apiRoutes.ts` prevents typos in API paths:

```typescript
// Good: Type-safe route reference
apiClient.getJson<UserProfile>(API_ROUTES.profile);

// Bad: String literal, easy to mistype
apiClient.getJson<UserProfile>("/proflie"); // typo not caught at compile time
```

## Credentials Handling

The `apiClient` automatically includes `credentials: 'include'` on all requests:

```typescript
// Frontend automatically includes session cookies
apiClient.getJson<UserProfile>(API_ROUTES.profile);
// Sends: GET /profile with credentials: 'include'

// Backend middleware can validate session
router.use((req, res, next) => {
  const userId = req.user?.id; // From auth middleware
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  next();
});
```

## Environment-Aware URLs

Different environments use different backend domains, handled by `.env` files:

**Local Development** (`.env`):

```
VITE_API_URL="http://localhost:4000"
```

**Staging** (`.env.staging`):

```
VITE_API_URL="https://staging-api.trident.com"
```

**Production** (`.env.production`):

```
VITE_API_URL="https://api.trident.com"
```

Frontend code doesn't change, only the `.env` file changes per environment.

## Testing Type Contracts

You can verify the contract between frontend and backend:

```bash
# Check all types compile correctly
npm run typecheck --workspace=shared
npm run typecheck --workspace=backend
npm run typecheck --workspace=frontend

# Run backend server
npm run dev --workspace=backend

# Run frontend dev server
npm run dev --workspace=frontend

# API calls now have full type safety
```

## Reverse Proxy Integration

When deployed behind Nginx, frontend and backend share a single domain via path-based routing:

```nginx
server {
  listen 80;
  server_name trident.com;

  # API requests go to backend
  location /api/ {
    proxy_pass http://backend:4000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # All other requests served from frontend
  location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
  }
}
```

Frontend's `apiClient` reads `VITE_API_URL` from environment and makes requests like `/api/profile`, which Nginx routes to the backend.

## Summary

| Aspect                 | Benefit                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| Single Source of Truth | Backend and frontend always use same types                        |
| Type Safety            | Compile errors for mismatches, autocomplete in IDE                |
| Breaking Changes       | Detected at compile time, not at runtime                          |
| Easy Refactoring       | Rename fields/endpoints across entire project safely              |
| Self-Documenting       | Code shows what data flows between frontend/backend               |
| Environment Switching  | One `.env` file change switches all API calls to different domain |
| Session Persistence    | Automatic credentials inclusion on all requests                   |

This architecture ensures that as your Trident platform grows, data remains consistent and type-safe across all layers.
