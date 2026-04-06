# Security & Edge Case Checklist (Trident Engines)

- [ ] Validate all incoming payloads for type and required fields
- [ ] Sanitize user input to prevent injection attacks
- [ ] Handle unknown or unsupported actions gracefully
- [ ] Limit payload size to prevent DoS
- [ ] Avoid leaking stack traces or internal errors in responses
- [ ] Add authentication/authorization if needed
- [ ] Rate limit sensitive endpoints
- [ ] Log errors and suspicious activity for audit
- [ ] Test for edge cases: empty, null, malformed, or oversized payloads
- [ ] Review for sensitive data exposure in logs or responses
