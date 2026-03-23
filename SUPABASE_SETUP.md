# Supabase Setup Guide for Stacklite

This guide will help you set up Supabase for the Stacklite application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js 18+ installed
- This Stacklite project cloned locally

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Project name**: Stacklite (or your preferred name)
   - **Database password**: Choose a strong password (save it securely)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important keys:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
4. Copy these values - you'll need them in the next step

## Step 3: Configure Environment Variables

1. In your Stacklite project root, find the `.env.local` file
2. Open it and fill in the values you copied:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. To get the Service Role Key:
   - Go back to **Settings > API** in Supabase
   - Scroll down to **Service Role** section
   - **⚠️ WARNING**: Never expose this key to the client! It bypasses RLS.
   - Copy the `service_role` key
4. Save the `.env.local` file

## Step 4: Run Database Migration

You have two options to set up the database schema:

### Option A: Using Supabase SQL Editor (Recommended for first-time setup)

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/20260212000000_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" message
7. Verify tables were created:
   - Go to **Table Editor** in the left sidebar
   - You should see: `profiles`, `clients`, `contracts`, `invoices`, `invoice_items`, `time_logs`

### Option B: Using Supabase CLI (For advanced users)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   cd /path/to/Stacklite.live
   supabase link --project-ref your-project-ref
   ```

3. Push the migration:
   ```bash
   supabase db push
   ```

## Step 5: Configure Authentication

### Enable Email/Password Authentication

1. Click **Authentication** in the left sidebar
2. Click **Providers**
3. Make sure **Email** is enabled (it should be by default)
4. **Email confirmation**: For development, you can disable this
   - Go to **Authentication > Settings**
   - Scroll to **Email Auth**
   - Toggle OFF "Confirm email"
   - Click **Save**

### Enable Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services > Library**
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: Stacklite
   - Authorized redirect URIs: Add this URL:
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
   - Click **Create**
5. Copy the Client ID and Client Secret
6. In Supabase:
   - Go to **Authentication > Providers**
   - Find **Google** and enable it
   - Paste your Client ID and Client Secret
   - Click **Save**

### Enable Apple OAuth (Optional)

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new identifier:
   - **Identifiers > App IDs**
   - Register a new App ID
   - Enable "Sign in with Apple"
3. Create a Service ID:
   - **Identifiers > Services IDs**
   - Register new Service ID
   - Enable "Sign in with Apple"
   - Configure domains and redirect URLs
4. Follow [Supabase's Apple OAuth guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
5. In Supabase:
   - Go to **Authentication > Providers**
   - Find **Apple** and enable it
   - Fill in the required credentials
   - Click **Save**

## Step 6: Verify Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try to sign up:
   - Go to `/signup`
   - Create a new account with email/password
   - You should be redirected to `/dashboard` after signup

4. Check Supabase:
   - Go to **Authentication > Users** in Supabase
   - You should see your newly created user
   - Go to **Table Editor > profiles**
   - You should see a profile row created automatically

5. Test protection:
   - Log out
   - Try to access `/dashboard`
   - You should be redirected to `/login`

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the correct keys
- Make sure there are no extra spaces in `.env.local`
- Restart your Next.js dev server after changing environment variables

### "relation 'public.profiles' does not exist"
- The database migration didn't run successfully
- Go to Supabase SQL Editor and run the migration manually
- Check for error messages in the SQL editor

### "User is not authenticated" on protected routes
- Check that middleware is set up correctly
- Clear browser cookies and try again
- Check browser console for errors

### Google OAuth not working
- Verify the redirect URI is exactly correct (including https://)
- Check that Google+ API is enabled
- Make sure you're using the correct Client ID/Secret

### Users can see other users' data
- This indicates RLS (Row Level Security) is not set up correctly
- Run the migration again to ensure all RLS policies are created
- Go to Supabase > Authentication > Policies and verify policies exist

## Next Steps

After successful setup:

1. ✅ Explore the Supabase dashboard
2. ✅ Create a test client in the Clients module
3. ✅ Test time tracking functionality
4. ✅ Generate a test contract
5. ✅ Create a test invoice

## Production Deployment

When deploying to production:

1. Create a separate Supabase project for production
2. Update production environment variables in your hosting platform (Vercel)
3. Enable email confirmation for production
4. Set up custom SMTP server for emails (optional)
5. Configure domain and SSL properly for OAuth redirects
6. Enable additional security features in Supabase settings

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [Stack Overflow - Supabase Tag](https://stackoverflow.com/questions/tagged/supabase)

---

**Last Updated**: February 12, 2026
