# MERN Stack Learning Management System

A full-stack LMS built with **React (Vite) + React Bootstrap**, **Node.js/Express** and **MongoDB (Mongoose)**.
Students browse and enroll in courses, instructors manage courses and lessons, admins manage users and view analytics.

## Technologies

- Frontend: React 18, React Router 6, Axios, Bootstrap 5, React Bootstrap, Bootstrap Icons
- Backend: Node.js, Express, Mongoose, JWT (jsonwebtoken), Bcrypt (bcryptjs), dotenv, CORS
- Database: MongoDB

## Project structure

```
mslms/
  server/   config/ models/ controllers/ routes/ middleware/ server.js seed.js
  client/   src/components  src/pages  src/services  src/context  src/App.jsx
```

## Installation

Prerequisites: Node.js 18+ and MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1. Backend
cd server
npm install
cp .env      # set MONGO_URI and a long random JWT_SECRET
npm run seed              # optional: demo users + courses
npm run dev               # http://localhost:5000

# 2. Frontend
cd client
npm install
npm run dev               # http://localhost:5173
```

### Demo accounts (after `npm run seed`)

| Role       | Email                | Password      |
| ---------- | -------------------- | ------------- |
| Admin      | admin@mslms.com      | admin123      |
| Instructor | instructor@mslms.com | instructor123 |
| Student    | student@mslms.com    | student123    |

## API

| Method             | Endpoint                                         | Access                                    |
| ------------------ | ------------------------------------------------ | ----------------------------------------- |
| POST               | /api/register, /api/login                        | Public                                    |
| GET                | /api/me                                          | Logged in                                 |
| GET                | /api/courses, /api/courses/:id                   | Public                                    |
| POST               | /api/courses                                     | Instructor, Admin                         |
| PUT / DELETE       | /api/courses/:id                                 | Owner instructor, Admin                   |
| POST / DELETE      | /api/courses/:id/lessons[/:lessonId]             | Owner instructor, Admin                   |
| POST               | /api/enroll `{courseId}`                         | Student                                   |
| GET                | /api/my-courses                                  | Student                                   |
| PUT                | /api/my-courses/:courseId/lessons/:lessonId      | Student (toggle lesson, updates progress) |
| GET / PUT / DELETE | /api/admin/users[/:id], GET /api/admin/analytics | Admin                                     |

Send the token as `Authorization: Bearer <token>`.

## Security

- Passwords hashed with bcrypt; JWT secret and DB URI live in `.env` (never committed).
- `protect` + `authorize(...roles)` middleware guards backend routes; `ProtectedRoute` guards dashboards.
- Public registration can only create Student or Instructor accounts; Admin comes from the seed script or an existing admin.

## Deployment

```bash
npm run install:all
npm run build
NODE_ENV=production npm start
```

Set `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production` on your host (Render, Railway, etc.).

## Testing checklist (for screenshots)

Register -> Login -> Add/edit/delete course (instructor) -> Add lesson -> Enroll (student) -> Tick lessons, see progress -> Admin analytics/users -> Try visiting `/admin` as a student (redirected).

## Deploying the API on Vercel

1. Create a free MongoDB Atlas cluster. Database Access: add a user. Network Access: allow `0.0.0.0/0`.
2. Push the repo to GitHub. In Vercel: New Project, import it, set **Root Directory** to `server`.
3. Add Environment Variables: `MONGO_URI` (Atlas connection string ending in `/mslms`), `JWT_SECRET`, `CLIENT_URL` (your frontend URL, comma separated if several).
4. Deploy, then open `https://<your-app>.vercel.app/api/health`.
5. Seed the Atlas database once from your PC: set `MONGO_URI` in `server/.env` to the Atlas string and run `npm run seed`.
6. Frontend: set `VITE_API_URL=https://<your-api>.vercel.app` (no trailing slash) in the client's environment variables and redeploy. A frontend project on Vercel also needs `client/vercel.json` (included) so page refreshes work with React Router.
