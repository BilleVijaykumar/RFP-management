# AI-Powered RFP Management System

A comprehensive web application that streamlines the Request for Proposal (RFP) workflow using AI to extract requirements, parse vendor responses, and provide intelligent recommendations.

## Features

- **Natural Language RFP Creation**: Describe procurement needs in plain English, and AI extracts structured requirements
- **Vendor Management**: Maintain a database of vendors with contact information
- **Email Integration**: Send RFPs to vendors via email and automatically receive/parse responses
- **AI-Powered Proposal Parsing**: Automatically extract pricing, terms, and compliance data from vendor responses
- **Intelligent Comparison**: AI-assisted comparison of proposals with scores, strengths, weaknesses, and recommendations

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 Turbo
- **Email**: Nodemailer (SMTP) + IMAP for receiving
- **PDF Parsing**: pdf-parse
- **Logging**: Winston

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key
- Email account with SMTP/IMAP access (Gmail, Outlook, etc.)

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb rfp_db
# Or using psql:
# psql -U postgres
# CREATE DATABASE rfp_db;
```

### 3. Environment Configuration

Create `.env` files in both `backend/` and `frontend/` directories.

#### Backend `.env` (create `backend/.env`):

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rfp_db?schema=public"

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# SMTP (Email Sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM=your_email@gmail.com

# IMAP (Email Receiving)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_TLS=true
IMAP_USER=your_email@gmail.com
IMAP_PASSWORD=your_app_password_here

# Email Polling
ENABLE_EMAIL_POLLING=true
EMAIL_POLL_INTERVAL=300000

# Logging
LOG_LEVEL=info
```

#### Frontend `.env` (create `frontend/.env`):

```env
VITE_API_URL=http://localhost:3001/api
```

**Note for Gmail users**: You'll need to generate an "App Password" in your Google Account settings (2-Step Verification must be enabled).

### 4. Database Migration

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run the Application

#### Development Mode (runs both frontend and backend):

```bash
npm run dev
```

#### Or run separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Documentation

### RFP Endpoints

#### Create RFP from Natural Language
```
POST /api/rfps/create-from-text
Body: { "text": "I need to procure laptops..." }
Response: { "success": true, "data": { RFP object } }
```

#### Create RFP Manually
```
POST /api/rfps
Body: { "title": "...", "requirements": [...], ... }
Response: { "success": true, "data": { RFP object } }
```

#### Get All RFPs
```
GET /api/rfps
Response: { "success": true, "data": [ RFP objects ] }
```

#### Get RFP by ID
```
GET /api/rfps/:id
Response: { "success": true, "data": { RFP object with proposals } }
```

#### Update RFP
```
PUT /api/rfps/:id
Body: { "title": "...", ... }
Response: { "success": true, "data": { RFP object } }
```

#### Delete RFP
```
DELETE /api/rfps/:id
Response: { "success": true, "message": "RFP deleted successfully" }
```

#### Send RFP to Vendors
```
POST /api/rfps/:id/send
Body: { "vendorIds": ["vendor-id-1", "vendor-id-2"] }
Response: { "success": true, "data": { "results": [...] } }
```

#### Compare Proposals
```
GET /api/rfps/:id/compare
Response: { "success": true, "data": { "comparison": { ... } } }
```

### Vendor Endpoints

#### Get All Vendors
```
GET /api/vendors
Response: { "success": true, "data": [ Vendor objects ] }
```

#### Get Vendor by ID
```
GET /api/vendors/:id
Response: { "success": true, "data": { Vendor object } }
```

#### Create Vendor
```
POST /api/vendors
Body: { "name": "...", "email": "...", ... }
Response: { "success": true, "data": { Vendor object } }
```

#### Update Vendor
```
PUT /api/vendors/:id
Body: { "name": "...", ... }
Response: { "success": true, "data": { Vendor object } }
```

#### Delete Vendor
```
DELETE /api/vendors/:id
Response: { "success": true, "message": "Vendor deleted successfully" }
```

### Proposal Endpoints

#### Get All Proposals
```
GET /api/proposals
Response: { "success": true, "data": [ Proposal objects ] }
```

#### Get Proposal by ID
```
GET /api/proposals/:id
Response: { "success": true, "data": { Proposal object } }
```

#### Get Proposals for RFP
```
GET /api/proposals/rfp/:rfpId
Response: { "success": true, "data": [ Proposal objects ] }
```

### Email Endpoints

#### Get All Emails
```
GET /api/emails?direction=inbound&rfpId=...
Response: { "success": true, "data": [ Email objects ] }
```

#### Test Email Connection
```
POST /api/emails/test
Response: { "success": true, "message": "Email connection successful" }
```

## Data Models

### RFP
```typescript
{
  id: string;
  title: string;
  description?: string;
  requirements: Array<{
    item: string;
    quantity?: number;
    specifications?: string;
  }>;
  budget?: number;
  deadline?: Date;
  status: 'draft' | 'sent' | 'closed';
  paymentTerms?: string;
  warranty?: string;
  deliveryTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Vendor
```typescript
{
  id: string;
  name: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  category?: string;
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Proposal
```typescript
{
  id: string;
  rfpId: string;
  vendorId: string;
  status: 'received' | 'parsed' | 'evaluated';
  rawContent?: string;
  extractedData?: {
    pricing: { total?: number; items?: Array<...> };
    terms: { payment?: string; warranty?: string; delivery?: string };
    compliance: { meetsRequirements: boolean; ... };
  };
  aiSummary?: string;
  aiScore?: number;
  complianceScore?: number;
  createdAt: Date;
  parsedAt?: Date;
}
```

## AI Integration

The system uses OpenAI GPT-4 Turbo for three main tasks:

1. **RFP Extraction**: Converts natural language procurement descriptions into structured RFP data
2. **Proposal Parsing**: Extracts structured data (pricing, terms, compliance) from vendor email responses
3. **Comparison & Recommendation**: Analyzes multiple proposals and provides scores, strengths, weaknesses, and recommendations

### Prompt Engineering

- **Structured Output**: Uses JSON mode for consistent parsing
- **Temperature Settings**: Lower temperature (0.3) for extraction/parsing, higher (0.5) for comparison
- **Error Handling**: Fallback mechanisms and validation for AI responses

## Email Integration

### Sending Emails
- Uses SMTP (Nodemailer) to send RFP emails to vendors
- Emails include structured RFP details in a readable format

### Receiving Emails
- IMAP polling service checks for new emails every 5 minutes (configurable)
- Automatically detects RFP responses by subject/content
- Extracts text from email body and PDF attachments
- Creates proposals automatically when vendor is identified

## Design Decisions & Assumptions

### Architecture
- **Monorepo Structure**: Keeps frontend and backend together for easier development
- **RESTful API**: Clear resource-based endpoints
- **TypeScript**: Type safety across the stack
- **Prisma ORM**: Type-safe database access with migrations

### Data Modeling
- **Flexible Requirements**: JSONB field for RFP requirements allows varying structures
- **Extracted Data Storage**: JSONB for proposal data accommodates different response formats
- **Status Tracking**: Clear status fields for RFPs and proposals

### AI Usage
- **Structured Extraction**: Focus on extracting structured data rather than free-form analysis
- **Compliance Scoring**: Simple algorithm based on presence of required fields
- **Comparison Depth**: AI provides detailed analysis with reasoning

### Email Handling
- **Polling vs Webhooks**: Chose IMAP polling for simplicity (no webhook setup required)
- **Attachment Support**: PDF parsing for common proposal formats
- **Error Resilience**: Emails saved even if vendor not found for manual processing

### Limitations
- Single-user system (no authentication)
- Email polling may have delays (5-minute intervals)
- PDF parsing limited to text extraction
- No real-time updates (polling-based)
- Manual vendor matching if email doesn't match exactly

## Future Enhancements

- User authentication and multi-tenant support
- Real-time WebSocket updates for email processing
- Enhanced PDF parsing with table extraction
- Email templates customization
- Advanced scoring algorithms
- Export comparison reports (PDF/Excel)
- Email tracking (opens, clicks)
- RFP versioning and approval workflows

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in `.env`
- Ensure database exists: `psql -l`

### Email Issues
- For Gmail: Use App Password, not regular password
- Check SMTP/IMAP settings match your email provider
- Verify firewall allows connections to email servers

### AI API Issues
- Verify OPENAI_API_KEY is set correctly
- Check API quota/limits
- Review error logs for specific API errors

### Frontend Not Connecting to Backend
- Verify backend is running on port 3001
- Check CORS settings
- Verify VITE_API_URL in frontend `.env`

## License

This project is created for educational/demonstration purposes.

