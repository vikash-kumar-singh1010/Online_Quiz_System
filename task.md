# Add Node.js/Express + MongoDB Backend

## Backend Setup
- [ ] Create `backend/package.json` with dependencies
- [ ] Install backend dependencies
- [ ] Create `backend/.env` with local MongoDB URI
- [ ] Create `backend/server.js` (Express + Mongoose)

## Backend Models
- [ ] Create `models/User.js`
- [ ] Create `models/Quiz.js`
- [ ] Create `models/Result.js`

## Backend Middleware & Routes
- [ ] Create `middleware/auth.js` (JWT verification)
- [ ] Create `routes/auth.js` (signup, login, me)
- [ ] Create `routes/quizzes.js` (CRUD)
- [ ] Create `routes/results.js` (submit, query)

## Frontend API Integration
- [ ] Create `services/api.js` (fetch helper with auth headers)
- [ ] Rewrite `services/authService.js` to use API
- [ ] Rewrite `services/quizService.js` to use API
- [ ] Delete `services/mockDb.js`
- [ ] Update `ResultPage.jsx` (remove mockDb import)
- [ ] Update `AdminQuizResults.jsx` (remove mockDb import)
- [ ] Add proxy to frontend `package.json`

## Verification
- [ ] Start backend, verify MongoDB connection
- [ ] Test full signup → login → create quiz → take quiz → results flow
