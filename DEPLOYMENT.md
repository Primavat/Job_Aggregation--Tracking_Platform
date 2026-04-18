# 🚀 Deployment Guide

Complete guide for setting up, configuring, and deploying the job recommendation SaaS platform.

---

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 13+** (or Supabase account for managed Postgres)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **API Keys:**
  - Groq (for LLM processing)
  - Anthropic Claude (optional alternative to Groq)
  - Google Service Account (for Google Sheets export)
  - Telegram Bot Token (optional, for notifications)

---

## 🏗️ Architecture Overview

```
┌──────────────────┐         ┌──────────────────┐
│  Frontend        │  HTTP   │  Backend API     │
│  (Next.js)       │ ◄────► │  (FastAPI)       │
│  Port 3000       │         │  Port 8000       │
└──────────────────┘         └─────────┬────────┘
                                       │
                                       │ SQL
                                       ▼
                             ┌──────────────────┐
                             │  PostgreSQL DB   │
                             │  (Supabase/Local)│
                             └──────────────────┘

Global Pipeline (Background):
├── APScheduler runs every 12h
├── Collects from 4 Job APIs
├── Claude AI processes jobs
└── Stores in shared DB
```

---

## 🐳 Option 1: Docker Compose (Recommended for Local Development)

### Setup

```bash
# Clone repository
git clone <repo-url>
cd Personal-job-recommendation-system

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env with your API keys
nano backend/.env
```

### Configuration (.env file)

```env
# Database (Docker internal)
DATABASE_URL=postgresql://job_user:job_password@postgres:5432/job_recommendations

# AI Backend
AI_BACKEND=groq
AI_API_KEY=your_groq_api_key_here
AI_MODEL=llama-3.3-70b-versatile

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Google Sheets export
GOOGLE_CREDENTIALS_FILE=credentials.json

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Start Services

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

### Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes database)
docker-compose down -v
```

---

## 🖥️ Option 2: Local Development (Manual Setup)

### Backend Setup

```bash
# Create virtual environment
cd backend
python -m venv venv

# Activate venv
source venv/bin/activate          # Linux/Mac
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env

# Initialize database (requires PostgreSQL running)
python -c "from backend.app.db.database import init_db; init_db()"

# Run server
uvicorn backend.app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Add API URL to .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local

# Run development server
npm run dev
```

### Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📦 Environment Configuration Details

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | (postgres URL) | PostgreSQL connection string |
| `JWT_SECRET` | Yes | (generated) | Secret key for JWT tokens (min 32 chars) |
| `AI_BACKEND` | Yes | `groq` | LLM provider: groq, gemini, claude, openrouter |
| `AI_API_KEY` | Yes | — | API key for selected AI backend |
| `AI_MODEL` | Yes | llama-3.3-70b-versatile | Model identifier |
| `PIPELINE_INTERVAL_HOURS` | No | `12` | Global pipeline run frequency |
| `ALLOWED_ORIGINS` | No | localhost | CORS allowed origins (comma-separated) |
| `GOOGLE_CREDENTIALS_FILE` | No | — | Path to Google Service Account JSON |
| `TELEGRAM_BOT_TOKEN` | No | — | Telegram bot token for notifications |
| `TELEGRAM_CHAT_ID` | No | — | Telegram chat ID for notifications |

### Frontend (.env.local)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | http://localhost:8000 | Backend API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | No | — | Supabase URL (if using) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | — | Supabase public key (if using) |

---

## 🗄️ Database Setup

### Option A: Docker (Easiest)

```bash
# Already configured in docker-compose.yml
docker-compose up postgres -d

# Connect via DBeaver or CLI
psql postgresql://job_user:job_password@localhost:5432/job_recommendations
```

### Option B: Supabase (Cloud-Hosted)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from "Connect" → "PostgreSQL"
4. Set as `DATABASE_URL` in `.env`
5. Initialize tables:

```bash
python -c "from backend.app.db.database import init_db; init_db()"
```

### Option C: Local PostgreSQL

```bash
# Install PostgreSQL (macOS example)
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
createdb job_recommendations

# Create user
psql job_recommendations -c "CREATE USER job_user WITH PASSWORD 'job_password';"
psql job_recommendations -c "GRANT ALL PRIVILEGES ON DATABASE job_recommendations TO job_user;"

# Test connection
psql postgresql://job_user:job_password@localhost:5432/job_recommendations
```

---

## 🔑 Authentication Setup

### JWT Token Generation

```bash
# Generate a secure JWT secret (run in Python)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Place this value in `JWT_SECRET` in your `.env` file.

### Test Login

1. Navigate to http://localhost:3000/login
2. Enter `test@example.com` (auto-seeded user)
3. Token is stored in localStorage
4. API calls automatically include Authorization header

---

## 🚀 Deployment Options

### Railway (Recommended)

1. **Connect Repository**
   - Push code to GitHub
   - Create Railway project
   - Connect GitHub repo

2. **Configure Environment**
   - Add all variables from `.env.example`
   - Set DATABASE_URL to your Postgres URL
   - Set ALLOWED_ORIGINS to include your Railway domain

3. **Deploy**
   - Railway auto-deploys on push
   - Backend runs on `backend` service
   - Frontend runs on `frontend` service

4. **Monitor**
   - View logs: `railway logs`
   - Check health: `/health` endpoint

### Vercel + Railway Stack

**Frontend (Vercel):**
```bash
# Deploy frontend
vercel deploy --prod
```

**Backend (Railway):**
- Uses Procfile for commands
- Auto-detects Python environment
- Uses APScheduler for background jobs

### Docker Hub

```bash
# Build images
docker build -f Dockerfile.backend -t yourname/jobrec-backend .
docker build -f Dockerfile.frontend -t yourname/jobrec-frontend .

# Push to registry
docker push yourname/jobrec-backend
docker push yourname/jobrec-frontend

# Deploy via Docker Compose or K8s
```

---

## 🔍 Health Checks

### Backend Health

```bash
curl http://localhost:8000/health
# Response: {"status": "ok", "message": "Backend API is running"}
```

### Frontend Health

```bash
curl http://localhost:3000
# Response: HTML page
```

### Database Connection

```bash
# From backend container
python -c "from backend.app.db.database import init_db; init_db()"
# Should complete without errors
```

### API Documentation

```
http://localhost:8000/docs        # Swagger UI
http://localhost:8000/redoc       # ReDoc
```

---

## 📊 Database Migrations

### Creating New Migrations (SQLAlchemy Auto)

```bash
# Models are auto-created on startup
# To add new fields to a model, edit backend/app/models/models.py
# Restart server to auto-migrate

# For manual control, use Alembic:
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "Add new field"
alembic upgrade head
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to a random 32+ char string
- [ ] Use HTTPS in production (set ALLOWED_ORIGINS with https://)
- [ ] Rotate API keys regularly
- [ ] Enable database backups
- [ ] Use environment-specific secrets
- [ ] Set strong database passwords
- [ ] Disable debug mode in production (DEBUG=False)
- [ ] Monitor logs for errors
- [ ] Implement rate limiting (optional)

---

## 🐛 Troubleshooting

### Database Connection Error

```
Error: could not connect to server: Connection refused
```

**Solution:**
- Check PostgreSQL is running: `brew services list`
- Verify DATABASE_URL is correct
- Test connection: `psql <DATABASE_URL>`

### Port Already in Use

```
ERROR: Address already in use
```

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000
kill -9 <PID>
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Add frontend URL to ALLOWED_ORIGINS in backend/.env
- Restart backend server
- Check browser console for exact error

### Pipeline Not Running

1. Check scheduler logs: `docker-compose logs backend | grep Scheduler`
2. Verify DB connection works
3. Check API keys are valid
4. Review error_log in database: `SELECT * FROM pipeline_runs WHERE status='failed'`

---

## 📈 Performance Tuning

### Database Optimization

```sql
-- Index frequently queried columns
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_pipeline_runs_user ON pipeline_runs(user_id);
```

### API Response Caching

Frontend uses React Query with automatic refetch intervals. Adjust in code:

```typescript
const { data } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => jobsAPI.list(),
  staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
});
```

### Background Job Optimization

Edit `backend/app/scheduler.py`:

```python
_INTERVAL_HOURS = 12  # Change collection frequency
```

---

## 📞 Support & Monitoring

### Logging

**Backend logs:**
```bash
docker-compose logs -f backend
```

**Frontend logs:**
```bash
# Browser console (F12)
```

### Key Metrics to Monitor

- Pipeline success rate (% completed vs failed)
- Average jobs collected per run
- Database size growth
- API response times
- Frontend load times
- Error rates by endpoint

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: npx railway up
```

---

## ✅ Deployment Checklist

- [ ] Database configured and tested
- [ ] All environment variables set
- [ ] API keys validated
- [ ] CORS origins configured
- [ ] JWT secret generated and stored
- [ ] Frontend and backend builds pass
- [ ] Health endpoints responding
- [ ] Test user can login
- [ ] Pipeline ran successfully
- [ ] Logs are being written correctly
- [ ] Monitoring/alerting set up
- [ ] Backups scheduled

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Production Ready ✅
