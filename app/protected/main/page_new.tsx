'use client';

import Link from 'next/link';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Dumbbell, ArrowRight, Sparkles, Target, Activity } from 'lucide-react';

export default function MainPage() {
  const features = [
    {
      title: 'Schedule',
      description: 'Plan and track your weekly fitness routine with personalized workout schedules',
      icon: Calendar,
      href: '/protected/schedule',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      stats: '8 workouts this week'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your fitness journey with custom tracking plans and detailed analytics',
      icon: TrendingUp,
      href: '/protected/tracking',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      stats: '2 active tracking plans'
    },
    {
      title: 'Workouts',
      description: 'Access a comprehensive library of exercises and create custom workout routines',
      icon: Dumbbell,
      href: '/protected/workouts',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      stats: '50+ exercises available'
    },
  ];

  const quickStats = [
    { label: 'Workout Streak', value: '5 days', icon: Target },
    { label: 'This Week', value: '4 workouts', icon: Activity },
    { label: 'Total Progress', value: '85%', icon: Sparkles },
  ];

  return (
    <>
      <ProtectedNavbar />
      <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-sky-400 to-sky-600 rounded-full shadow-lg mb-6">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to{' '}
              <span className="bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                Fitelier
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your comprehensive fitness companion. Track your progress, schedule workouts, and achieve your fitness goals.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-100 rounded-lg mb-4">
                      <Icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <CardHeader>
                      <div className={`inline-flex items-center justify-center w-14 h-14 bg-linear-to-br ${feature.bgGradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-7 h-7 text-transparent bg-linear-to-r ${feature.gradient} bg-clip-text`} />
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-sky-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-sky-600 font-medium">{feature.stats}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Getting Started Section */}
          <Card className="mt-12 bg-linear-to-r from-sky-500 to-sky-600 text-white">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-3">Ready to Start Your Fitness Journey?</h3>
              <p className="text-sky-100 mb-6 max-w-2xl mx-auto">
                Choose any of the features above to begin. Whether you want to schedule your workouts, 
                track your progress, or explore new exercises, Fitelier has you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/protected/schedule">
                  <button className="px-6 py-3 bg-white text-sky-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Plan Your Schedule
                  </button>
                </Link>
                <Link href="/protected/tracking">
                  <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-sky-600 transition-colors">
                    Start Tracking
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
