# 🚀 Quick Start Checklist

Before running `npm run dev`, complete these steps:

## ✅ Setup Checklist

### 1. Install Dependencies
```bash
npm install
```
**Status**: ✅ Already completed

### 2. Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and project name
4. Wait for database to initialize (~2 minutes)

**Status**: ⏳ **YOU ARE HERE** - Complete this step first!

### 3. Configure Environment Variables

After creating your Supabase project:

1. Go to: https://supabase.com/dashboard/project/_/settings/api
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon public** key (starts with `eyJ...`)
4. Open `.env.local` in your project
5. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Status**: ⏳ Waiting for Supabase project

### 4. Run Database Migration

1. Go to: https://supabase.com/dashboard/project/_/sql/new
2. Open `supabase/migrations/20260212000000_initial_schema.sql` in your code editor
3. Copy the **entire** SQL content
4. Paste into Supabase SQL Editor
5. Click "Run" button

**Status**: ⏳ Waiting for step 3

### 5. Configure Authentication

1. Go to: https://supabase.com/dashboard/project/_/auth/providers
2. Enable **Email** provider (should be on by default)
   - Keep email confirmation enabled so users verify before first sign in
3. Enable **Google** provider (optional):
   - Follow Google OAuth setup
   - Add redirect URL: `https://[your-project].supabase.co/auth/v1/callback`

**Status**: ⏳ Waiting for step 3

### 6. Start Development Server

```bash
npm run dev
```

Then open: http://localhost:3000

**Status**: ⏳ Complete steps 2-5 first!

---

## 📚 Detailed Guides

- **Full Setup**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Architecture**: See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- **Project Info**: See [README.md](./README.md)

---

## ⚠️ Common Issues

### "Supabase environment variables are not configured"
- Make sure you completed steps 2-3 above
- Verify `.env.local` has real values (not placeholders)
- Restart the dev server after editing `.env.local`

### "Failed to fetch clients"
- Make sure you ran the database migration (step 4)
- Check your internet connection
- Verify Supabase project is active

### Google OAuth not working
- Make sure redirect URL is configured correctly
- Wait a few minutes after enabling (Google needs time to propagate)

---

## 🎉 Once Setup is Complete

You'll have access to:
- ✅ Client Manager (Phase 2 - Complete!)
- 🚧 Time Tracker (Phase 3 - Coming soon)
- 🚧 Contract Generator (Phase 4)
- 🚧 Invoice Generator (Phase 5)
- 🚧 Income Tracker (Phase 6)
