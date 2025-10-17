# Smart Recruitment Dashboard

## Overview

An AI-powered recruitment platform that streamlines the hiring process through intelligent automation, bias detection, and data-driven insights. The system provides recruiters with a comprehensive dashboard to manage candidates, conduct interviews, analyze applications, and make informed hiring decisions. Key features include CSV candidate upload and parsing, AI-powered bias detection in job descriptions, automated interview scheduling, interactive AI chatbot assistant, and visual analytics with charts and performance metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query (React Query) for server state management and API data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system (New York style variant)
- Tailwind CSS for styling with custom design tokens
- Material Design + Linear aesthetic combination for professional productivity interface
- Custom color palette with light/dark mode support
- Typography: Inter for general UI, JetBrains Mono for data/metrics

**State & Data Management**
- React Query for async state, caching, and server synchronization
- Query invalidation strategy for optimistic updates
- Custom queryClient configuration with disabled automatic refetching for stability

**Key Design Patterns**
- Component composition using Radix UI Slot pattern
- Controlled and uncontrolled form inputs with react-hook-form
- Custom hooks for reusable logic (useToast, useIsMobile, useTheme)
- CSS variables for theme customization and dark mode support

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- ESM modules throughout the application
- Custom error handling middleware
- Request/response logging for API routes

**Data Layer**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (configured via @neondatabase/serverless)
- In-memory storage fallback (MemStorage class) for development/testing
- Schema-first approach with Drizzle Zod integration for validation

**API Design**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- File upload support via multer (CSV candidate imports)
- Structured error responses with appropriate HTTP status codes

**Core Business Logic**
- CSV parsing for bulk candidate import
- AI-powered features via OpenAI integration (GPT-5 model)
- Email generation for interview invitations (simulated sending)
- Bias analysis algorithms for job descriptions
- Interview performance evaluation

### Database Schema

**Primary Tables**
- `candidates`: Stores applicant information, skills, experience, status, and overall scores
- `interviews`: Tracks scheduled, in-progress, and completed interviews with recordings and performance data
- `job_descriptions`: Manages job postings with AI-analyzed fairness scores and bias indicators
- `chat_messages`: Persists AI chatbot conversation history
- `csv_uploads`: Logs bulk candidate upload history with metadata

**Key Relationships**
- Interviews reference candidates via `candidateId`
- All tables use UUID primary keys with auto-generation
- Array columns for multi-value fields (skills, requirements, bias indicators)
- JSONB columns for flexible structured data (resume data, interview questions/responses, analysis results)

**Status Tracking**
- Candidate statuses: applied, shortlisted, interviewed, rejected, hired
- Interview statuses: scheduled, in_progress, completed, cancelled

### External Dependencies

**AI & ML Services**
- OpenAI API (GPT-5) for:
  - AI chatbot interactions
  - Job description bias analysis
  - Interview question generation
  - Performance evaluation and sentiment analysis
  - Candidate assessment insights

**Database**
- Neon Database (PostgreSQL serverless) via `@neondatabase/serverless`
- Configured through `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations

**UI Libraries**
- Recharts for data visualization (radar charts, bar charts, pie charts)
- Radix UI component primitives (40+ components)
- Lucide React for icons
- date-fns for date manipulation
- cmdk for command palette functionality

**Development Tools**
- Replit-specific plugins (cartographer, dev-banner, runtime error overlay)
- TypeScript for type checking
- ESBuild for production bundling
- Vite middleware integration for development HMR

**Email & Communications** (Configured but Simulated)
- Email sending infrastructure (currently mocked)
- Meeting link generation for Google Meet/Zoom
- Automated interview invitation workflows

**File Processing**
- Multer for multipart/form-data file uploads
- Custom CSV parser for candidate data extraction
- Support for various CSV column formats and delimiters