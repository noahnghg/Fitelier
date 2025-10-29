'use client';

import { useState, useEffect } from 'react';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Dumbbell, Heart, Zap, Clock, Flame, TrendingUp, Loader2 } from 'lucide-react';
import { workoutService } from '@/lib/database';
import type { Workout } from '@/lib/supabase';

export default function WorkoutsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await workoutService.getWorkouts({ isPublic: true });
      
      if (fetchError) throw fetchError;
      
      setWorkouts(data || []);
    } catch (err: any) {
      console.error('Error fetching workouts:', err);
      setError(err.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Dumbbell className="w-4 h-4" />;
      case 'cardio':
        return <Heart className="w-4 h-4" />;
      case 'flexibility':
        return <Zap className="w-4 h-4" />;
      default:
        return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cardio':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'flexibility':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filterWorkouts = (type?: string) => {
    let filtered = workouts;
    if (type) {
      filtered = filtered.filter(w => w.type === type);
    }
    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered;
  };

  const renderWorkoutCard = (workout: Workout) => (
    <Card key={workout.id} className="hover:shadow-lg transition-all group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getTypeBadgeColor(workout.type)}>
                {getTypeIcon(workout.type)}
                <span className="ml-1 capitalize">{workout.type}</span>
              </Badge>
              <Badge variant="secondary" className={getDifficultyColor(workout.difficulty)}>
                {workout.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-xl group-hover:text-sky-600 transition-colors">
              {workout.name}
            </CardTitle>
            <CardDescription className="mt-2">{workout.description || 'No description'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{workout.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">{workout.estimated_calories || 0} cal</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">{workout.exercise_count} exercises</span>
          </div>
        </div>
        <Button className="w-full bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <>
        <ProtectedNavbar />
        <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4">
          <div className="container mx-auto max-w-6xl flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-sky-600" />
              <p className="text-gray-600">Loading workouts...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProtectedNavbar />
        <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-600">Error: {error}</p>
                <Button onClick={fetchWorkouts} className="mt-4">Retry</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProtectedNavbar />
      <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Library</h1>
              <p className="text-gray-600">Browse and start your fitness journey</p>
            </div>
            <Button className="bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Workout
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Workout Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Workouts</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
              <TabsTrigger value="cardio">Cardio</TabsTrigger>
              <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterWorkouts().map(renderWorkoutCard)}
              </div>
            </TabsContent>

            <TabsContent value="strength">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterWorkouts('strength').map(renderWorkoutCard)}
              </div>
            </TabsContent>

            <TabsContent value="cardio">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterWorkouts('cardio').map(renderWorkoutCard)}
              </div>
            </TabsContent>

            <TabsContent value="flexibility">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterWorkouts('flexibility').map(renderWorkoutCard)}
              </div>
            </TabsContent>
          </Tabs>

          {/* AI Recommendation Card */}
          <Card className="mt-8 bg-linear-to-br from-sky-50 to-white border-sky-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <CardTitle>AI Recommendation</CardTitle>
              </div>
              <CardDescription>
                Based on your goals and recent activity, we recommend:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-1">Full Body Strength</h4>
                  <p className="text-sm text-gray-600">Perfect for building balanced muscle development</p>
                </div>
                <Button className="bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                  Try This Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
