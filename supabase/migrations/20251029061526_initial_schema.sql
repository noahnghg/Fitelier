-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET row_security = on;

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    age INTEGER,
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    fitness_goal TEXT CHECK (fitness_goal IN ('lose_weight', 'gain_muscle', 'maintain', 'improve_endurance', 'general_fitness')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')) DEFAULT 'moderately_active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workouts table (exercise library)
CREATE TABLE public.workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('strength', 'cardio', 'flexibility')) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
    estimated_calories INTEGER,
    exercise_count INTEGER DEFAULT 0,
    instructions JSONB, -- Array of exercise instructions
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scheduled_workouts table (user's workout schedule)
CREATE TABLE public.scheduled_workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
    custom_name TEXT, -- For custom workouts not in the library
    custom_description TEXT,
    workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'flexibility')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    duration_minutes INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tracking_plans table (custom progress tracking)
CREATE TABLE public.tracking_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    unit TEXT NOT NULL, -- 'kg', 'lbs', 'cm', 'inches', 'reps', etc.
    category TEXT CHECK (category IN ('weight', 'strength', 'measurement', 'other')) NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tracking_entries table (progress data points)
CREATE TABLE public.tracking_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_plan_id UUID REFERENCES public.tracking_plans(id) ON DELETE CASCADE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table (individual exercises that make up workouts)
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    muscle_groups TEXT[], -- Array of muscle groups
    equipment TEXT[], -- Array of required equipment
    instructions TEXT[],
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    type TEXT CHECK (type IN ('strength', 'cardio', 'flexibility', 'balance')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises junction table
CREATE TABLE public.workout_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    sets INTEGER,
    reps INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    weight_kg DECIMAL(5,2),
    distance_meters INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    UNIQUE(workout_id, exercise_id, order_index)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_scheduled_workouts_user_date ON public.scheduled_workouts(user_id, scheduled_date);
CREATE INDEX idx_scheduled_workouts_date ON public.scheduled_workouts(scheduled_date);
CREATE INDEX idx_tracking_plans_user ON public.tracking_plans(user_id);
CREATE INDEX idx_tracking_entries_plan_date ON public.tracking_entries(tracking_plan_id, entry_date);
CREATE INDEX idx_workouts_type ON public.workouts(type);
CREATE INDEX idx_workouts_difficulty ON public.workouts(difficulty);
CREATE INDEX idx_exercises_type ON public.exercises(type);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Workouts: Users can see public workouts and their own workouts
CREATE POLICY "Users can view public workouts" ON public.workouts
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create workouts" ON public.workouts
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own workouts" ON public.workouts
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own workouts" ON public.workouts
    FOR DELETE USING (created_by = auth.uid());

-- Scheduled workouts: Users can only manage their own scheduled workouts
CREATE POLICY "Users can manage own scheduled workouts" ON public.scheduled_workouts
    FOR ALL USING (user_id = auth.uid());

-- Tracking plans: Users can only manage their own tracking plans
CREATE POLICY "Users can manage own tracking plans" ON public.tracking_plans
    FOR ALL USING (user_id = auth.uid());

-- Tracking entries: Users can only manage entries for their own tracking plans
CREATE POLICY "Users can manage own tracking entries" ON public.tracking_entries
    FOR ALL USING (
        tracking_plan_id IN (
            SELECT id FROM public.tracking_plans WHERE user_id = auth.uid()
        )
    );

-- Exercises: Everyone can view exercises, only authenticated users can create
CREATE POLICY "Anyone can view exercises" ON public.exercises
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can create exercises" ON public.exercises
    FOR INSERT TO authenticated WITH CHECK (true);

-- Workout exercises: Users can manage exercises for their own workouts
CREATE POLICY "Users can manage workout exercises" ON public.workout_exercises
    FOR ALL USING (
        workout_id IN (
            SELECT id FROM public.workouts WHERE created_by = auth.uid() OR is_public = true
        )
    );

-- Functions to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_scheduled_workouts_updated_at
    BEFORE UPDATE ON public.scheduled_workouts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_tracking_plans_updated_at
    BEFORE UPDATE ON public.tracking_plans
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_tracking_entries_updated_at
    BEFORE UPDATE ON public.tracking_entries
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
