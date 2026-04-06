# Environment Variables

## Backend (`infra/env/backend.example.env`)

| Variable     | Description                  | Default               |
| ------------ | ---------------------------- | --------------------- |
| NODE_ENV     | Environment mode             | development           |
| PORT         | Server port                  | 4000                  |
| DATABASE_URL | PostgreSQL connection string | —                     |
| JWT_SECRET   | JWT signing secret           | —                     |
| CORS_ORIGIN  | Allowed CORS origin          | http://localhost:3000 |

## Frontend (`infra/env/frontend.example.env`)

| Variable      | Description              | Default               |
| ------------- | ------------------------ | --------------------- |
| VITE_API_URL  | Backend API URL          | http://localhost:4000 |
| VITE_APP_NAME | Application display name | Trident               |
