# Program Builder - Athlete Training Management System

## Overview

This is a full-stack web application for managing athlete training programs. Built with React and Express, it provides a comprehensive interface for creating, viewing, editing, and deleting training programs for athletes. The application uses a modern tech stack with TypeScript, shadcn/ui components, and follows a clean separation between client and server code.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- React Query (TanStack Query) for server state management with infinite stale time and disabled refetching by default

**UI Component System:**
- shadcn/ui (New York variant) as the primary component library
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Design aesthetic inspired by Linear and Vercel dashboards

**Form Management:**
- React Hook Form for form state and validation
- Zod for schema validation
- @hookform/resolvers for integrating Zod with React Hook Form

**Design System:**
- Dark mode as primary theme with system-based color palette
- Custom color tokens defined in CSS variables
- Consistent spacing using Tailwind's scale (2, 4, 6, 8 units)
- Inter font family or system font stack fallback
- Utility classes for elevation effects (hover-elevate, active-elevate-2)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- ES Modules (type: "module" in package.json)
- Custom error handling middleware
- Request/response logging middleware with performance tracking

**Development vs Production:**
- Vite middleware integration in development mode
- Static file serving in production
- SSR template rendering for initial page load
- Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)

**API Architecture:**
- RESTful API design with /api prefix for all routes
- JSON request/response format
- Credential-based authentication support (credentials: "include")
- Centralized storage interface pattern for data operations

### Data Layer

**Database Configuration:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the database (via @neondatabase/serverless)
- Schema-first approach with type inference
- Migrations stored in ./migrations directory
- Drizzle-Zod integration for runtime validation from database schemas

**Data Models:**
- Users table with UUID primary keys, username, and password fields
- Athlete and Program interfaces defined in shared schema
- Type-safe insert and select types generated from Drizzle schemas

**Storage Pattern:**
- Abstract IStorage interface defining CRUD operations
- MemStorage implementation for in-memory data (currently active)
- Designed for easy swapping to database-backed storage
- Shared schema types between client and server via @shared imports

### External Dependencies

**Core Infrastructure:**
- Neon Database serverless driver for PostgreSQL connections
- Connect-pg-simple for PostgreSQL session storage
- Date-fns for date manipulation and formatting

**UI Component Libraries:**
- 25+ Radix UI primitives (@radix-ui/react-*)
- Embla Carousel for carousel functionality
- Lucide React for icons
- CMDK for command palette functionality
- Recharts for charting (infrastructure present)
- Vaul for drawer components

**Development Tools:**
- TSX for TypeScript execution in development
- ESBuild for production server bundling
- Drizzle Kit for database migrations and schema management
- Replit-specific development plugins for enhanced DX

**Path Aliases:**
- @/ maps to client/src/
- @shared/ maps to shared/
- @assets/ maps to attached_assets/