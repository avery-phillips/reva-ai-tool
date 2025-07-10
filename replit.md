# REVA - Real Estate Tenant Lead Generation App

## Overview

REVA is a modern full-stack web application that generates targeted tenant leads for commercial real estate properties. The application uses a form-based interface to collect property requirements and generates relevant business leads through a mock AI-powered system. Built with a modern tech stack including React, TypeScript, Express, and PostgreSQL with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

## Key Components

### Frontend Architecture
- **React SPA**: Single-page application with client-side routing using Wouter
- **Component Library**: shadcn/ui provides a comprehensive set of accessible UI components
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Form Management**: React Hook Form integrated with Zod schemas for validation
- **Data Fetching**: TanStack Query handles API calls and caching

### Backend Architecture
- **Express Server**: RESTful API server with middleware for logging and error handling
- **Development Setup**: Vite integration for hot module replacement in development
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)

### Data Model
The application uses Zod schemas for type safety across the stack:
- **Lead Form Schema**: Captures business type, location, square footage, and property features
- **Tenant Lead Schema**: Represents generated leads with business details and contact information
- **Property Features**: Predefined list of commercial property features

## Data Flow

1. **User Input**: Users fill out a lead generation form with property requirements
2. **Validation**: Client-side validation using Zod schemas ensures data integrity
3. **Lead Generation**: Mock AI system generates relevant business leads based on form data
4. **Results Display**: Generated leads are displayed with options to export or copy
5. **Export Options**: Users can export leads to CSV or copy to clipboard

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18 with TypeScript support
- **UI Components**: Radix UI primitives with shadcn/ui wrapper components
- **Database**: Neon serverless PostgreSQL with Drizzle ORM
- **Development Tools**: Vite for fast development builds and HMR

### Key Libraries
- **Form Handling**: @hookform/resolvers for Zod integration
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography
- **Styling**: class-variance-authority and clsx for dynamic styling

## Deployment Strategy

### Development
- **Development Server**: Vite dev server with Express API proxy
- **Hot Reload**: Full-stack hot reloading for rapid development
- **Error Handling**: Runtime error overlay for debugging

### Production Build
- **Client Build**: Vite builds optimized React bundle to `dist/public`
- **Server Build**: esbuild compiles Express server to `dist/index.js`
- **Static Serving**: Express serves built client files in production

### Database Management
- **Schema Migrations**: Drizzle Kit handles database schema changes
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection
- **Type Safety**: Drizzle generates TypeScript types from database schema

### Current Implementation Notes
- **Storage**: Currently uses in-memory storage with interface ready for database integration
- **Lead Generation**: Mock implementation returns predefined business data
- **Authentication**: Not implemented in current version
- **Real-time Features**: Not implemented in current version

The architecture is designed to be scalable and maintainable, with clear separation of concerns and type safety throughout the stack.