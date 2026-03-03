# Digital Editorial Journal - Supabase Setup

This application uses Supabase for realtime data and admin authentication.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Go to **Settings -> API** and copy your `Project URL` and `anon public` key.

## 2. Setup Database Schema
1. Open **SQL Editor**.
2. Run `supabase_schema.sql`.
3. Run `update_schema_moderation.sql`.

The schema now includes:
- `articles`, `comments`, `moderation_logs`
- `admin_users` table
- `public.is_admin()` helper function
- RLS policies that restrict article write/delete and moderation actions to admins.

## 3. Configure Environment Variables
1. Create `.env` based on `.env.example`.
2. Fill in:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Restart dev server or rebuild.

## 4. Create an Admin Account
1. In Supabase Dashboard, go to **Authentication -> Users**.
2. Create a user with email/password.
3. Copy that user's UUID.
4. Insert it into `admin_users`:
   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR_AUTH_USER_UUID');
   ```

Only users in `admin_users` can write/delete articles and moderate comments/logs.

## 5. Initialize Data
1. Sign in at `/#/admin/login` using the admin user's email/password.
2. If the article table is empty, click **Initialize DB** in dashboard.

