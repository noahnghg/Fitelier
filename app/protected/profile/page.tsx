'use client';

import { useState, useEffect } from 'react';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Ruler, Weight, Target, Camera, Loader2 } from 'lucide-react';
import { useAuth, useProfile } from '@/lib/auth';
import { profileService } from '@/lib/database';
import type { Profile } from '@/lib/supabase';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile: userProfile, loading: profileLoading, updateProfile: updateUserProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    email: '',
    age: undefined,
    height_cm: undefined,
    weight_kg: undefined,
    fitness_goal: undefined,
  });

  useEffect(() => {
    if (userProfile) {
      setProfile({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        age: userProfile.age,
        height_cm: userProfile.height_cm,
        weight_kg: userProfile.weight_kg,
        fitness_goal: userProfile.fitness_goal,
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      const { data, error: updateError } = await profileService.updateProfile(user.id, profile);
      
      if (updateError) throw updateError;
      
      if (data) {
        await updateUserProfile(profile);
        setEditing(false);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <>
        <ProtectedNavbar />
        <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4">
          <div className="container mx-auto max-w-4xl flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-sky-600" />
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProtectedNavbar />
      <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="fitness">Fitness Details</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={userProfile?.avatar_url || "https://github.com/shadcn.png"} alt={profile.full_name || 'User'} />
                      <AvatarFallback>{(profile.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  <Separator />

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Personal Details Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            value={profile.full_name || ''}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            className="pl-10"
                            disabled={!editing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={profile.email || ''}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="pl-10"
                            disabled={true}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="age"
                            type="number"
                            value={profile.age || ''}
                            onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                            className="pl-10"
                            disabled={!editing}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      {editing ? (
                        <>
                          <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave} className="bg-linear-to-r from-sky-500 to-sky-600" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setEditing(true)} className="bg-linear-to-r from-sky-500 to-sky-600">
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fitness">
              <Card>
                <CardHeader>
                  <CardTitle>Fitness Details</CardTitle>
                  <CardDescription>Track your physical metrics and fitness goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="height"
                          type="number"
                          value={profile.height_cm || ''}
                          onChange={(e) => setProfile({ ...profile, height_cm: parseInt(e.target.value) })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="weight"
                          type="number"
                          value={profile.weight_kg || ''}
                          onChange={(e) => setProfile({ ...profile, weight_kg: parseInt(e.target.value) })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="goal">Fitness Goal</Label>
                      <div className="relative">
                        <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select
                          id="goal"
                          value={profile.fitness_goal || ''}
                          onChange={(e) => setProfile({ ...profile, fitness_goal: e.target.value as any })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm"
                        >
                          <option value="">Select a goal</option>
                          <option value="lose_weight">Lose Weight</option>
                          <option value="gain_muscle">Gain Muscle</option>
                          <option value="maintain">Maintain</option>
                          <option value="improve_endurance">Improve Endurance</option>
                          <option value="general_fitness">General Fitness</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* BMI Calculation */}
                  {profile.weight_kg && profile.height_cm && (
                    <div className="mt-6 p-4 bg-sky-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Body Mass Index (BMI)</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-sky-600">
                          {(profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {(() => {
                            const bmi = profile.weight_kg / Math.pow(profile.height_cm / 100, 2);
                            if (bmi < 18.5) return 'Underweight';
                            if (bmi < 25) return 'Normal weight';
                            if (bmi < 30) return 'Overweight';
                            return 'Obese';
                          })()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button className="bg-linear-to-r from-sky-500 to-sky-600">
                      Update Fitness Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your Fitelier experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive workout reminders and tips</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Weekly Progress Reports</h4>
                        <p className="text-sm text-gray-500">Get your weekly fitness summary</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">AI Coaching Tips</h4>
                        <p className="text-sm text-gray-500">Receive personalized tips from AI</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-linear-to-r from-sky-500 to-sky-600">
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
