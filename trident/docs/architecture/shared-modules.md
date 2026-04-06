# Shared Modules

The `shared/` package provides types, constants, and utilities consumed by both backend and frontend.

## Contents

- `types/` — API response types, model interfaces
- `constants/` — App name, tier levels, cycle states, RPC targets
- `utils/` — formatAmount, truncateWallet, sleep
- `validation/` — Zod/Yup schemas (placeholder)
- `config/` — Shared config (placeholder)

## Usage

Import via path alias: `import { TIER_LEVELS } from '@shared/constants'`
