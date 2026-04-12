# Query Hub

## Tech Stack

- **TypeScript** (100%)
- **Node.js / Express** (v5)
- **MongoDB + Mongoose**
- **Passport.js** (Local)
- **JWT** (`jsonwebtoken`) for stateless authentication
- **bcrypt** for password hashing
- **express-validator** for server-side validation
- **nodemailer** for email services
---

## Project Structure

```txt
src/
  app.ts
  config/
    passport.ts
    swagger.ts
  controllers/
    admin.controller.ts
    answer.controller.ts
    auth.controller.ts
    comment.controller.ts
    question.controller.ts
    tag..controller.ts
    user.controller.ts
  middlewares/
    isAdmin.ts
    isAuth.ts
    validators.ts
  models/
    answer.model.ts
    comment.model.ts
    question.model.ts
    tag.model.ts
    user.model.ts
  routes/
    admin.routes.ts
    answer.routes.ts
    auth.routes.ts
    comment.routes.ts
    question.routes.ts
    tag.routes.ts
    user.routes.ts
  types/
    auth.ts
    express.d.ts
  utils/
    ApiFeatures.ts
    jwt.ts
    tokenBlacklist.ts
```

---

## Setup & Installation

### 1) Install dependencies
```bash
npm install
```

### 2) Create a `.env` file
Create a `.env` file in the repository root:

```env
PORT
DB_LOCAL
JWT_SECRET
EMAIL
PASS
```

> `DB_LOCAL` is used by the app to connect to MongoDB.

### 3) Run in development
```bash
npm run dev
```

### 4) Build & run production
```bash
npm run build
npm start
```

---

## API Documentation (Swagger)

After starting the server, open:

- `http://localhost:3000/api/docs`

Swagger is configured in `src/config/swagger.ts` and mounted in `src/app.ts`:

- Swagger spec uses OpenAPI 3.0
- JWT bearer auth scheme is defined (`bearerAuth`)
- JSDoc comments are read from:
  - `src/routes/*.ts`
  - `src/controllers/*.ts`

---

## Authentication

Authentication is handled via Passport.js. A JWT or session cookie is returned upon successful login and should be used for protected routes. If using JWT, include it as:

```
Authorization: Bearer <token>
```

---

## Validation

Validation middleware is built using `express-validator` and defined in:

- `src/middlewares/`

Includes checks for user inputs (like registration and login payloads) to ensure data integrity before reaching the controllers. If validation fails, the server sends a `400` response with `errors: [...]`.

---

## Notes / Known Behaviors

- The server acts as a robust backend foundation, handling authentication, routing, and database connections. 
- The server uses an error handler that returns HTTP **501** with:
  ```json
  { "status": "error", "message": "<error message>" }
  ```

---

## License

ISC
