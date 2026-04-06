export const securityConfig = {
  corsOrigins: ['http://localhost:5173', 'http://localhost:3000'],
  jwtSecret: process.env.JWT_SECRET || '',
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100,
};
