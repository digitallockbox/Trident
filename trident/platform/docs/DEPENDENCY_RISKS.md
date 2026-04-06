# DEPENDENCY RISKS

## Overview

This document lists all known high/medium security risks in third-party dependencies, with mitigations and monitoring plans. Updated after every Snyk scan.

---

## 1. High/Medium Issues (as of 2026-03-29)

### Regular Expression Denial of Service (ReDoS)

- **Location:** backend/lib/router-esm.js, express, ws
- **Severity:** High
- **Mitigation:** All user input is sanitized and validated before reaching any regex. No unsafe regex in custom code. Monitor upstream for patches.

### Cleartext Transmission (HTTP Instead of HTTPS)

- **Location:** backend/lib/server.ts, express, ws
- **Severity:** Medium
- **Mitigation:** HTTPS enforced in production. HTTP only allowed in local/dev. Nginx config blocks non-TLS in prod.

### Insecure Hash (Insufficient Computational Effort)

- **Location:** cookie-signature, etag, pg, ws
- **Severity:** Low/Medium
- **Mitigation:** Used only for non-critical operations or by dependencies. Monitor for upstream fixes.

### Hardcoded Non-Cryptographic Secret

- **Location:** test files only
- **Severity:** Low
- **Mitigation:** No secrets hardcoded in production code. Tests use mock data.

---

## 2. Monitoring Plan

- **Snyk scans** run on every PR and deploy (see ci/security-audit.yml).
- **Dependency updates** reviewed monthly.
- **Critical issues** block deployment until resolved or mitigated.

## 3. Documentation

- This file is updated after every audit.
- All mitigations are referenced in SECURITY_MODEL.md.

## Contact

For dependency risk questions, contact: security@trident-platform.example
