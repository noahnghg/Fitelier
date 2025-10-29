'use client';

import { useState } from 'react';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Ruler, Weight, Target, Camera } from 'lucide-react';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 28,
    height: 175,
    weight: 75,
    goal: 'Build Muscle',
  });

  const handleSave = () => {
    // TODO: Implement save profile API call
    setEditing(false);
  };

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
                      <AvatarImage src="https://github.com/shadcn.png" alt={profile.name} />
                      <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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

                  {/* Personal Details Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
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
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="pl-10"
                            disabled={!editing}
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
                            value={profile.age}
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
                          <Button variant="outline" onClick={() => setEditing(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave} className="bg-linear-to-r from-sky-500 to-sky-600">
                            Save Changes
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
                          value={profile.height}
                          onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
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
                          value={profile.weight}
                          onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="goal">Fitness Goal</Label>
                      <div className="relative">
                        <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="goal"
                          value={profile.goal}
                          onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BMI Calculation */}
                  <div className="mt-6 p-4 bg-sky-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Body Mass Index (BMI)</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-sky-600">
                        {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">Normal weight</span>
                    </div>
                  </div>

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
