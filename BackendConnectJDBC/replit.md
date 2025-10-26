# Fraud Detection System

A comprehensive transaction monitoring system with real-time fraud detection, role-based access control, and advanced security features.

## Overview

This is a full-stack fraud detection system built with:
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + PostgreSQL + Drizzle ORM
- **Authentication**: Session-based auth with bcrypt password hashing
- **Database**: PostgreSQL with Neon serverless

## Recent Changes

- **2025-01-26**: Complete fraud detection system implementation
  - User authentication with role-based access (admin/user)
  - Transaction management with automatic fraud detection
  - Admin dashboard for reviewing all transactions
  - User dashboard for personal transaction management
  - Dark theme UI with beautiful animations and interactions
  - Real-time statistics and analytics

## Project Architecture

### Frontend Structure
- `/client/src/pages/` - Main application pages
  - `Landing.tsx` - Landing page for unauthenticated users
  - `Auth.tsx` - Login and registration
  - `AdminDashboard.tsx` - Admin transaction review panel
  - `UserDashboard.tsx` - User transaction management with sidebar
- `/client/src/components/` - Reusable components
  - `StatCard.tsx` - Statistics display cards
  - `TransactionTable.tsx` - Transaction listing with actions
  - `TransactionDialog.tsx` - Form for creating transactions

### Backend Structure
- `/server/routes.ts` - All API endpoints
- `/server/storage.ts` - Database operations interface
- `/server/auth.ts` - Authentication middleware and password hashing
- `/server/db.ts` - Database connection setup

### Database Schema
- **users**: User accounts with role-based access
  - Fields: id, email, password (hashed), username, fullName, country, phoneNumber, role
  - Roles: 'user' (default) or 'admin'
- **transactions**: Financial transactions with fraud detection
  - Fields: id, userId, amount, location, description, status, timestamp
  - Status: 'pending', 'approved', or 'flagged'

## Features

### Fraud Detection Rules
1. **High-Value Transactions**: Transactions over $5,000 are automatically flagged
2. **Foreign Transactions**: Transactions from locations different from user's country are flagged

### User Roles
- **User**: Can create transactions, view own transactions, manage profile
- **Admin**: Can view all transactions, approve/flag/delete transactions, add random test data

### Security Features
- Bcrypt password hashing (10 salt rounds)
- Session-based authentication with PostgreSQL session store
- Role-based access control middleware
- Secure HTTP-only cookies

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password and role
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user info
- `PATCH /api/auth/profile` - Update user profile

### Transactions
- `GET /api/transactions` - Get user's transactions (authenticated)
- `GET /api/transactions/all` - Get all transactions (admin only)
- `POST /api/transactions` - Create new transaction (authenticated)
- `PATCH /api/transactions/:id/status` - Update transaction status (admin only)
- `DELETE /api/transactions/:id` - Delete transaction (admin only)

## User Preferences

- Dark theme by default
- Clean, modern interface with smooth animations
- Mobile-responsive design
- Accessible with proper ARIA labels and semantic HTML

## Test Users

To test the application, you can create users with these roles:
- **User Role**: Register normally (default role is 'user')
- **Admin Role**: Register first, then manually update the user's role in the database to 'admin'

## Development

### Running the Application
```bash
npm run dev
```

### Database Commands
```bash
npm run db:push        # Push schema changes to database
npm run db:push --force  # Force push schema changes
```

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Secret for session encryption
