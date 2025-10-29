-- =====================================================
-- FITELIER SUPABASE - MINIMAL SETUP (START HERE)
-- =====================================================
-- This is a minimal version that fixes the auth issue
-- Run this first, then run the full setup if needed
-- =====================================================

-- 1. ENABLE RLS ON PROFILES
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- 3. CREATE RLS POLICIES FOR PROFILES
-- =====================================================

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to insert profiles (for triggers)
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Users can insert own profile on signup"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. CREATE TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip
    RETURN new;
  WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 5. CREATE TRIGGER
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. AUTO-UPDATE TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these to verify:

-- Check trigger exists
SELECT tgname as trigger_name, tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check function exists
SELECT proname as function_name
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check RLS is enabled
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check policies
SELECT policyname
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- DONE!
-- =====================================================
-- ✅ Automatic profile creation via trigger
-- ✅ Row Level Security enabled on profiles
-- ✅ Proper policies for profile access
-- ✅ Auto-update timestamps
-- 
-- Now try signing up in your app!
-- =====================================================
