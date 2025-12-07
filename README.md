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

- **Node.js**: Version 18.x or 20.x (tested with Node.js 18.17.0 and 20.10.0)
- **npm**: Version 9.x or 10.x (comes with Node.js)
- **PostgreSQL**: Version 14+ (tested with PostgreSQL 14.9 and 15.4)
- **OpenAI API Key**: Get from https://platform.openai.com/api-keys
- **Email Account**: With SMTP/IMAP access (Gmail recommended, requires App Password)

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

### 6. Seed Data (Optional)

To populate the database with sample vendors and RFPs for testing:

```bash
cd backend
npm run seed
```

This will create:
- 3 sample vendors (Tech Solutions Inc., Office Supplies Co., Global Electronics)
- 1 sample RFP (Office Equipment Procurement)

## API Documentation

### RFP Endpoints

#### Create RFP from Natural Language
```
POST /api/rfps/create-from-text
Content-Type: application/json

Request Body:
{
  "text": "I need to procure 20 laptops with 16GB RAM and 15 monitors 27-inch. Budget is $50,000 total. Need delivery within 30 days. Payment terms should be net 30, and we need at least 1 year warranty."
}

Success Response (200):
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "Laptop and Monitor Procurement",
    "description": "Procurement of laptops and monitors",
    "requirements": [
      {
        "item": "Laptops",
        "quantity": 20,
        "specifications": "16GB RAM"
      },
      {
        "item": "Monitors",
        "quantity": 15,
        "specifications": "27-inch"
      }
    ],
    "budget": 50000,
    "deadline": "2024-12-31T00:00:00.000Z",
    "paymentTerms": "Net 30",
    "warranty": "1 year minimum",
    "deliveryTerms": "Within 30 days",
    "status": "draft",
    "createdAt": "2024-12-07T10:00:00.000Z",
    "updatedAt": "2024-12-07T10:00:00.000Z"
  }
}

Error Response (400):
{
  "success": false,
  "error": "Invalid input: text is required"
}

Error Response (500):
{
  "success": false,
  "error": "Failed to create RFP: AI service unavailable"
}
```

#### Create RFP Manually
```
POST /api/rfps
Content-Type: application/json

Request Body:
{
  "title": "Office Equipment Procurement",
  "description": "Procurement of laptops and monitors for new office",
  "requirements": [
    {
      "item": "Laptops",
      "quantity": 20,
      "specifications": "16GB RAM, Intel i7"
    },
    {
      "item": "Monitors",
      "quantity": 15,
      "specifications": "27-inch, 4K"
    }
  ],
  "budget": 50000,
  "deadline": "2024-12-31",
  "paymentTerms": "Net 30",
  "warranty": "1 year",
  "deliveryTerms": "Within 30 days",
  "status": "draft"
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "Office Equipment Procurement",
    "description": "Procurement of laptops and monitors for new office",
    "requirements": [...],
    "budget": 50000,
    "deadline": "2024-12-31T00:00:00.000Z",
    "status": "draft",
    "createdAt": "2024-12-07T10:00:00.000Z",
    "updatedAt": "2024-12-07T10:00:00.000Z"
  }
}

Error Response (400):
{
  "success": false,
  "error": "Validation error: title is required"
}
```

#### Get All RFPs
```
GET /api/rfps

Success Response (200):
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "title": "Office Equipment Procurement",
      "description": "Procurement of laptops and monitors",
      "status": "draft",
      "createdAt": "2024-12-07T10:00:00.000Z",
      "updatedAt": "2024-12-07T10:00:00.000Z"
    }
  ]
}

Error Response (500):
{
  "success": false,
  "error": "Failed to fetch RFPs"
}
```

#### Get RFP by ID
```
GET /api/rfps/clx1234567890

Success Response (200):
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "Office Equipment Procurement",
    "description": "Procurement of laptops and monitors",
    "requirements": [...],
    "status": "draft",
    "proposals": [
      {
        "id": "clx9876543210",
        "vendorId": "clx1111111111",
        "status": "parsed",
        "aiScore": 85,
        "complianceScore": 90
      }
    ],
    "createdAt": "2024-12-07T10:00:00.000Z",
    "updatedAt": "2024-12-07T10:00:00.000Z"
  }
}

Error Response (404):
{
  "success": false,
  "error": "RFP not found"
}
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
POST /api/rfps/clx1234567890/send
Content-Type: application/json

Request Body:
{
  "vendorIds": ["clx1111111111", "clx2222222222"]
}

Success Response (200):
{
  "success": true,
  "data": {
    "results": [
      {
        "vendorId": "clx1111111111",
        "vendorName": "Tech Solutions Inc.",
        "email": "vendor1@example.com",
        "sent": true,
        "messageId": "msg-123456"
      },
      {
        "vendorId": "clx2222222222",
        "vendorName": "Office Supplies Co.",
        "email": "vendor2@example.com",
        "sent": true,
        "messageId": "msg-123457"
      }
    ]
  }
}

Error Response (400):
{
  "success": false,
  "error": "No vendors selected"
}

Error Response (500):
{
  "success": false,
  "error": "Failed to send emails: SMTP connection failed"
}
```

#### Compare Proposals
```
GET /api/rfps/clx1234567890/compare

Success Response (200):
{
  "success": true,
  "data": {
    "comparison": {
      "summary": "3 proposals compared",
      "proposals": [
        {
          "vendorId": "clx1111111111",
          "vendorName": "Tech Solutions Inc.",
          "totalPrice": 48000,
          "aiScore": 85,
          "complianceScore": 90,
          "strengths": ["Competitive pricing", "Meets all requirements"],
          "weaknesses": ["Longer delivery time"],
          "recommendation": "Strong candidate"
        }
      ],
      "bestMatch": {
        "vendorId": "clx1111111111",
        "reason": "Best balance of price, compliance, and terms"
      }
    }
  }
}

Error Response (400):
{
  "success": false,
  "error": "Need at least 2 proposals to compare"
}

Error Response (404):
{
  "success": false,
  "error": "RFP not found"
}
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
Content-Type: application/json

Request Body:
{
  "name": "Tech Solutions Inc.",
  "email": "vendor@example.com",
  "contactPerson": "John Doe",
  "phone": "+1-555-0101",
  "category": "IT Equipment",
  "notes": "Preferred vendor"
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": "clx1111111111",
    "name": "Tech Solutions Inc.",
    "email": "vendor@example.com",
    "contactPerson": "John Doe",
    "phone": "+1-555-0101",
    "category": "IT Equipment",
    "notes": "Preferred vendor",
    "createdAt": "2024-12-07T10:00:00.000Z",
    "updatedAt": "2024-12-07T10:00:00.000Z"
  }
}

Error Response (400):
{
  "success": false,
  "error": "Validation error: email is required and must be valid"
}

Error Response (409):
{
  "success": false,
  "error": "Vendor with this email already exists"
}
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

## AI Tools Usage During Development

### Tools Used

This project was built with assistance from the following AI tools:

- **Cursor AI**: Primary development assistant for code generation, refactoring, and debugging
- **GitHub Copilot**: Inline code suggestions and autocomplete
- **ChatGPT (OpenAI)**: Design decisions, architecture planning, and problem-solving discussions

### What They Helped With

1. **Boilerplate Code Generation**
   - Initial project structure setup (Express.js backend, React frontend)
   - Prisma schema design and migrations
   - API route structure and controllers
   - React component scaffolding

2. **Debugging & Problem Solving**
   - Resolving TypeScript type errors
   - Fixing Prisma ORM query issues
   - Debugging email integration (SMTP/IMAP) connection problems
   - Troubleshooting AI API integration challenges

3. **Design & Architecture**
   - Database schema design decisions
   - API endpoint structure and RESTful conventions
   - Frontend component architecture
   - State management patterns

4. **Code Quality & Best Practices**
   - TypeScript type definitions
   - Error handling patterns
   - Validation schemas using Zod
   - Code organization and structure

5. **Documentation**
   - README structure and content
   - API documentation examples
   - Code comments and explanations

### Notable Prompts/Approaches

1. **"Create a full-stack RFP management system with AI integration"**
   - Generated initial project structure and tech stack recommendations

2. **"Design a Prisma schema for RFP, Vendor, and Proposal entities with relationships"**
   - Resulted in flexible JSONB fields for requirements and extracted data

3. **"Implement email polling service that parses vendor responses and extracts proposal data using AI"**
   - Led to IMAP polling architecture with automatic proposal creation

4. **"Create React components for RFP management with modern UI/UX"**
   - Generated component structure with gradient designs and responsive layouts

5. **"Fix text visibility issues on gradient backgrounds"**
   - Helped identify CSS specificity issues and implement proper white text styling

### Learnings & Changes

1. **AI-Assisted Development Speed**
   - Significantly faster initial development with AI-generated boilerplate
   - More time could be spent on business logic and user experience

2. **Code Quality Improvements**
   - AI suggestions helped catch potential bugs early
   - Consistent code style across the project
   - Better error handling patterns

3. **Architecture Refinements**
   - Initial AI suggestions were refined through iterative conversations
   - JSONB fields for flexible data storage (better than rigid schemas)
   - Polling-based email system chosen over webhooks for simplicity

4. **Prompt Engineering Skills**
   - Learned to write more specific prompts for better results
   - Iterative refinement of prompts led to better code generation
   - Context management became crucial for maintaining consistency

5. **Limitations Realized**
   - AI tools are great for structure but require human judgment for business logic
   - Some generated code needed significant refactoring
   - Documentation still requires human review and customization

6. **Development Workflow Changes**
   - Shifted from writing code from scratch to reviewing and refining AI-generated code
   - More focus on testing and integration rather than initial implementation
   - Faster prototyping allowed for more experimentation

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

