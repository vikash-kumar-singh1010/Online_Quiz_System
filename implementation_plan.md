# Add Node.js/Express + MongoDB Backend

Replace localStorage-based mock DB with a real backend API server and MongoDB database.

## User Review Required

> [!IMPORTANT]
> **MongoDB Connection**: You'll need a MongoDB instance. I'll use a `MONGO_URI` env variable. You can use:
> - **MongoDB Atlas** (free tier) — cloud-hosted, recommended
> - **Local MongoDB** — install and run `mongod` locally
>
> The `.env` file will be created with a placeholder URI. You must update it before running.

> [!WARNING]
> **Breaking Change**: The frontend will no longer work standalone with localStorage. It will require the backend server running on `http://localhost:5000`. The GitHub Pages deployment will need a hosted backend to function (or can remain as a static demo).

> [!IMPORTANT]
> **Password Hashing**: Passwords will now be hashed with `bcryptjs` instead of stored in plain text. Existing localStorage data won't migrate — users will need to re-register.

---

## Proposed Changes

### Backend — New Express Server

All new files under `backend/`:

#### [NEW] [package.json](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/package.json)
- Dependencies: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`
- Dev: `nodemon`
- Scripts: `start`, `dev`

#### [NEW] [server.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/server.js)
- Express app setup, MongoDB connection via `mongoose.connect(MONGO_URI)`
- CORS configured for `http://localhost:3000`
- Mount route files: `/api/auth`, `/api/quizzes`, `/api/results`

#### [NEW] [.env](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/.env)
- `MONGO_URI`, `JWT_SECRET`, `PORT=5000`

---

#### [NEW] [models/User.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/models/User.js)
- Schema: `name`, `email` (unique), `password` (hashed), `role` (student/admin)

#### [NEW] [models/Quiz.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/models/Quiz.js)
- Schema: `title`, `description`, `timer`, `questions[]` (text, options[], correctAnswer), `createdBy` (ref User)

#### [NEW] [models/Result.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/models/Result.js)
- Schema: `userId`, `quizId`, `score`, `total`, `answers`, `warnings`, `timeTaken`, `timestamp`

---

#### [NEW] [middleware/auth.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/middleware/auth.js)
- JWT verification middleware — extracts user from `Authorization: Bearer <token>`

#### [NEW] [routes/auth.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/routes/auth.js)
- `POST /api/auth/signup` — hash password, create user, return JWT
- `POST /api/auth/login` — verify credentials + role, return JWT
- `GET /api/auth/me` — return current user from token

#### [NEW] [routes/quizzes.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/routes/quizzes.js)
- `GET /api/quizzes` — list all quizzes (auth required)
- `GET /api/quizzes/:id` — get single quiz (auth required)
- `POST /api/quizzes` — create quiz (admin only)

#### [NEW] [routes/results.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/backend/routes/results.js)
- `POST /api/results` — submit quiz result (student only)
- `GET /api/results/quiz/:quizId` — results by quiz (auth required)
- `GET /api/results/user` — results for current user (auth required)

---

### Frontend — Replace localStorage with API Calls

#### [MODIFY] [authService.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/frontend/src/services/authService.js)
- Replace direct localStorage calls with `fetch()` to `/api/auth/*`
- Store JWT token in localStorage instead of user object
- `getCurrentUser()` decodes token or calls `/api/auth/me`

#### [MODIFY] [quizService.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/frontend/src/services/quizService.js)
- Replace localStorage calls with `fetch()` to `/api/quizzes/*` and `/api/results/*`
- Add JWT `Authorization` header to all requests

#### [DELETE] [mockDb.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/frontend/src/services/mockDb.js)
- No longer needed — backend handles all data

#### [NEW] [api.js](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/frontend/src/services/api.js)
- `API_URL` constant, helper for `fetch` with auth headers

#### [MODIFY] [ResultPage.jsx](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/frontend/src/pages/student/ResultPage.jsx)
- Remove direct `getDb()` import — use service functions that now call API

#### [MODIFY] [AdminQuizResults.jsx](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/frontend/src/pages/admin/AdminQuizResults.jsx)
- Remove direct `getDb()` import — use service functions

#### [MODIFY] [package.json](file:///c:/Users/vikas/OneDrive/Desktop/AWT_Project/frontend/package.json)
- Add `"proxy": "http://localhost:5000"` for dev API proxying

---

## Verification Plan

### Automated Tests
- `cd backend && node server.js` — verify server starts and connects to MongoDB without errors

### Manual Verification (Browser)
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. **Signup flow**: Create a student account → should redirect to dashboard
4. **Login flow**: Log out, log back in → should work
5. **Admin flow**: Create admin account → create a quiz → verify it appears on dashboard
6. **Student quiz flow**: Log in as student → take quiz → verify result page shows
7. **Data persistence**: Refresh browser → data should persist (unlike localStorage-only)
