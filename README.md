# Stacklite - Freelancer Operating System

A lightweight, modular freelance workspace designed to help solo professionals manage their core business tasks in one place.

![Stacklite](https://img.shields.io/badge/status-in%20development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

> **⚠️ SETUP REQUIRED**: Before running the app, you must configure Supabase credentials.  
> **👉 Follow the [QUICK_START.md](./QUICK_START.md) guide** (5 minutes)

---

## 🎯 Overview

Stacklite is a production-ready SaaS application that provides freelancers with five essential tools:

- **Client Manager** - Organize and manage client information
- **Time Tracker** - Track working hours with precision
- **Contract Generator** - Create professional contracts with PDF export
- **Invoice Generator** - Build itemized invoices with automatic calculations
- **Income Tracker** - Monitor expected vs. actual earnings

## ✨ Features

### Currently Implemented (Phase 1)

- ✅ **Authentication System**
  - Email/password signup and login
   - In-container email verification flow after signup (resend + update email)
  - Google OAuth integration
  - Session management with Supabase  
  - Protected routes with Next.js middleware
  - Automatic profile creation

- ✅ **Core Infrastructure**
  - Next.js 14+ with App Router
  - TypeScript throughout
  - Tailwind CSS with design system
  - Supabase for backend (PostgreSQL + Auth)
  - React Query for server state management
  - Zustand for global UI state

- ✅ **Database Architecture**
  - Complete schema with RLS policies
  - User data isolation
  - Automated timestamps
  - Proper indexing for performance

### Coming Soon (Phases 2-5)

- 🚧 Client Manager module
- 🚧 Time Tracker module
- 🚧 Contract Generator with PDF export
- 🚧 Invoice Generator with PDF export
- 🚧 Income Tracker dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn  
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Stacklite.live
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

   Quick steps:
   - Create a Supabase project
   - Run the database migration from `supabase/migrations/20260212000000_initial_schema.sql`
   - Configure OAuth providers (optional)
   - Copy your API keys

4. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Stacklite.live/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── (dashboard)/              # Dashboard route group
│   │   └── dashboard/            # Main workspace
│   ├── auth/                     # Auth API routes
│   │   ├── callback/             # OAuth callback
│   │   └── signout/              # Sign out endpoint
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles + design system
├── components/                   # React components
│   ├── modules/                  # Feature modules
│   ├── layout/                   # Layout components
│   ├── ui/                       # Reusable UI components
│   └── QueryProvider.tsx         # React Query provider
├── lib/                          # Core utilities
│   ├── supabase/                 # Supabase clients
│   ├── api/                      # API abstraction layer
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
├── stores/                       # Zustand stores
├── hooks/                        # Custom React hooks
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
├── proxy.ts                      # Next.js proxy (auth)
├── IMPLEMENTATION_PLAN.md        # Detailed implementation plan
├── SUPABASE_SETUP.md            # Supabase setup guide
└── README.md                     # This file
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Query + Zustand
- **PDF Generation**: @react-pdf/renderer (planned)

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth

## 📖 Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Comprehensive 12-week development plan
- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Step-by-step Supabase configuration

## 📅 Development Roadmap

### Phase 1: Core Foundation ✅ (Completed)
- ✅ Next.js project setup
- ✅ Supabase configuration
- ✅ Authentication system
- ✅ Design system
- ✅ Database schema

### Phase 2-6: Module Development (In Progress)
- [ ] Client Manager
- [ ] Time Tracker
- [ ] Contract Generator
- [ ] Invoice Generator
- [ ] Income Tracker

## 🎨 Design Philosophy

> "Everything a freelancer needs. Nothing they don't."

Stacklite follows these core principles:
- **Minimal**: No unnecessary features or bloat
- **Calm**: Distraction-free interface
- **Modular**: Each tool is independent yet integrated
- **Fast**: Optimized for performance
- **Private**: Your data is yours, fully isolated via RLS

## 👨‍💻 Development

### Running Locally

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 📊 Current Status

**Phase 1 Complete** - Core foundation with authentication is ready for Phase 2 development.

---

**Last Updated**: February 12, 2026  
**Status**: Phase 1 Complete ✅
