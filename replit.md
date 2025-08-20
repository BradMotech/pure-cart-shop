# E-commerce Application

## Overview

A full-stack e-commerce web application built with React frontend and Express backend. The application features user authentication, product catalog browsing, shopping cart functionality, wishlist management, and admin product management. The system uses PostgreSQL as the primary database with Drizzle ORM for data operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for development and bundling
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for e-commerce branding
- **State Management**: React Context API for cart, authentication, and wishlist state
- **Data Fetching**: TanStack Query for server state management and caching
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Structure**: RESTful endpoints for products, users, orders, and wishlist management
- **Middleware**: Custom authentication middleware and request logging

### Database Design
The application uses a relational database schema with the following main entities:
- **Users**: Core user accounts with authentication credentials
- **User Roles**: Role-based access control (admin/user)
- **Products**: Product catalog with categories, pricing, and inventory
- **Wishlist**: User-specific product favorites
- **Orders & Order Items**: E-commerce order management

Key architectural decisions include using UUIDs as primary keys and implementing soft relationships through foreign key constraints.

### Authentication & Authorization
- JWT token-based authentication stored in localStorage
- Role-based access control with admin and user roles
- Protected routes and API endpoints based on authentication state
- Automatic token validation and refresh handling

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database service
- **Database Connection**: Uses connection pooling through @neondatabase/serverless

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production builds

### Potential Integrations
- **Supabase**: Alternative authentication and database solution (dependency present)
- **Payment Processing**: Infrastructure ready for payment gateway integration
- **File Storage**: Asset management system for product images