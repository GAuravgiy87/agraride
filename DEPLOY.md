# Quick Deploy Guide

## Local Build & Test

```bash
# Clean previous build
npm run clean

# Build frontend + backend
npm run build

# Test production locally
NODE_ENV=production npm start
```

Visit: `http://localhost:3000`

---

## Render Configuration

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
node dist/server.js
```

### Environment Variables
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host/dbname
```

---

## Deploy Steps

1. Push to GitHub
2. Connect repo to Render
3. Set Build Command (see above)
4. Set Start Command (see above)
5. Add Environment Variables (see above)
6. Click Deploy

---

## Test After Deploy

```bash
# API endpoint
https://your-app.onrender.com/api/debug/users

# Frontend
https://your-app.onrender.com/search
```

---

## Key Files

- **Frontend**: Built to `dist/index.html` by Vite
- **Backend**: Built to `dist/server.js` by esbuild
- **Server**: Serves both API and static frontend files

