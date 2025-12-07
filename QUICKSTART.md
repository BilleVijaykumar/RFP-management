# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL 14+ installed and running
- ✅ OpenAI API key (get from https://platform.openai.com/api-keys)
- ✅ Email account with SMTP/IMAP access (Gmail recommended)

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 2: Create Database
```bash
# Using psql
createdb rfp_db

# Or using PostgreSQL CLI
psql -U postgres -c "CREATE DATABASE rfp_db;"
```

### Step 3: Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rfp_db?schema=public"
OPENAI_API_KEY="sk-your-key-here"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="your-email@gmail.com"
IMAP_HOST="imap.gmail.com"
IMAP_USER="your-email@gmail.com"
IMAP_PASSWORD="your-app-password"
ENABLE_EMAIL_POLLING=true
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

> **Gmail Setup**: Enable 2-Step Verification, then generate an App Password at https://myaccount.google.com/apppasswords

### Step 4: Initialize Database
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed  # Optional: adds sample data
```

### Step 5: Start the Application
```bash
# From root directory
npm run dev
```

Visit http://localhost:3000

## First Use

1. **Create a Vendor**: Go to "Vendors" → "Add Vendor"
2. **Create an RFP**: Go to "Create RFP" → Enter natural language description
3. **Send RFP**: Open the RFP → Select vendors → Click "Send RFP"
4. **Receive Response**: System automatically polls emails every 5 minutes
5. **Compare**: When proposals arrive, click "Compare & Get Recommendation"

## Testing Without Email

You can test the system without email setup:
- Set `ENABLE_EMAIL_POLLING=false` in backend `.env`
- Manually create proposals via API or database
- Use the comparison feature with mock data

## Troubleshooting

**Database connection failed?**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL format

**Email not working?**
- Use App Password for Gmail (not regular password)
- Check SMTP/IMAP settings match your provider

**AI errors?**
- Verify OPENAI_API_KEY is correct
- Check API quota/limits

**Frontend can't connect?**
- Ensure backend is running on port 3001
- Check browser console for CORS errors

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints using the API documentation
- Customize email templates in `backend/src/services/email.service.ts`
- Adjust AI prompts in `backend/src/services/ai.service.ts`

