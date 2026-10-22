# Ex. No. 12 – Full Stack Student Management App (React + Node.js + MongoDB)

Live demo (frontend): https://sandeepmk2006.github.io/EXP-12-WTL-URK24CS1059/

GitHub Pages serves only static files, so on the live demo the app runs in
demo mode and keeps records in the browser. Run it locally to use the real
Express + MongoDB backend.

## Run locally

```bash
# Terminal 1 – backend (MongoDB must be running)
cd backend
cp .env.example .env
npm install
node server.js        # Backend running on port 5000

# Terminal 2 – frontend
cd frontend
npm install
npm run dev           # http://localhost:5173
```

## API

| Operation | Method | Endpoint |
|---|---|---|
| Create | POST | /api/students |
| Read | GET | /api/students?department=CSE |
| Update | PUT | /api/students/:id |
| Delete | DELETE | /api/students/:id |
