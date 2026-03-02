# Digital Editorial Journal - Supabase Setup

This application is ready for global real-time syncing using Supabase.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Go to **Settings -> API** to find your `URL` and `anon public` Key.

## 2. Setup Database Schema
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Copy the content of `supabase_schema.sql` (included in this package).
3. Paste it into the SQL Editor and run it. This will create the `articles` and `comments` tables and enable Realtime.

## 3. Configure Environment Variables
1. Rename `.env.example` to `.env`.
2. Open `.env` and fill in your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Rebuild the application (`pnpm build`).

## 4. Initialize Data
1. Log in to the Admin Dashboard (`/admin/login`).
2. If the database is empty, you will see an **"Initialize DB"** button.
3. Click it to upload the sample articles to your live database.

Enjoy your real-time editorial journal!
