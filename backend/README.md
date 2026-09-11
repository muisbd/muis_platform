# MUIS API (Express + MongoDB)

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Listens on http://localhost:5000

```text
backend/
  src/
    config/        Environment and MongoDB
    middleware/    JWT, roles, rate limits
    models/        Collections
    routes/        /api/v1/...
    seed/          Admin user + public content
    utils/         Email (Resend), Cloudinary, calendar, scoring
    server.js
```

Prayer journals are always loaded as `userId = logged-in student`. Staff routes do not expose them.
