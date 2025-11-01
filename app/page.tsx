'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Zap, Brain, TrendingUp, Menu, X, Sparkles, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-sky-100">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                Fitelier
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-gray-700 hover:text-sky-600 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-sky-600 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('technology')}
                className="text-gray-700 hover:text-sky-600 transition-colors"
              >
                Technology
              </button>
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-sky-600 hover:text-sky-700">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <button
                onClick={() => scrollToSection('hero')}
                className="block w-full text-left text-gray-700 hover:text-sky-600 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-gray-700 hover:text-sky-600 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('technology')}
                className="block w-full text-left text-gray-700 hover:text-sky-600 transition-colors"
              >
                Technology
              </button>
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full text-sky-600 border-sky-600 hover:bg-sky-50">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 mb-6">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-medium text-sky-600">AI-Powered Fitness Platform</span>
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                Fitelier
              </span>
              <br />
              <span className="text-gray-900">(AI)L-in-one fitness platform</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Idea and build by noahnghg
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg hover:shadow-xl text-lg font-semibold">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-sky-600 border-2 border-sky-600 hover:bg-sky-50 text-lg font-semibold">
                Watch Demo
              </Button>
            </div>

            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                Smart Features
              </span>
              <span className="text-gray-900"> for Your Fitness Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge AI technology to deliver personalized fitness experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="group bg-linear-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-linear-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">AI-Powered Plans</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Machine learning algorithms create personalized workout plans based on your goals, fitness level, and progress.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="group bg-linear-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-linear-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Progress Tracking</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Real-time analytics and insights help you understand your progress and optimize your training for maximum results.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="group bg-linear-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-linear-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Adaptive Workouts</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Workouts automatically adjust based on your performance, energy levels, and recovery to keep you in optimal training zones.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="group bg-linear-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-linear-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Goal Setting</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Set and track multiple fitness goals with smart milestones that keep you motivated throughout your journey.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="group bg-linear-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-linear-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Form Analysis</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  AI-powered form correction helps prevent injuries and ensures you're performing exercises with perfect technique.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="group bg-linear-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-linear-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Smart Recommendations</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Get personalized nutrition tips, recovery advice, and lifestyle recommendations powered by AI insights.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 px-6 bg-linear-to-b from-white to-sky-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">Developed by </span>
              <span className="bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                Advanced Technology Stacks
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              I used state-of-the-art AI and web technologies to build a robust, scalable, and intelligent fitness platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Gemini 2.5</h3>
                  <p className="text-gray-600">
                    The brain of Fitelier, responsible for answering fitness-related questions from users.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Computer Vision (Future Developments)</h3>
                  <p className="text-gray-600">
                    Real-time pose estimation and movement analysis to provide instant feedback on your exercise form and technique.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Predictive Analytics (Future Development)</h3>
                  <p className="text-gray-600">
                    Advanced algorithms predict your progress and optimize training loads to help you reach your goals faster and safer.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Recommendation Engine (Future Development)</h3>
                  <p className="text-gray-600">
                    A smart system that suggests workouts, etc. 
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-linear-to-br from-sky-100 to-sky-200 rounded-3xl p-8 shadow-xl">
                <div className="bg-white rounded-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Next.js</span>
                    <img className="w-8 h-8" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg">
                      <span className="text-gray-700 font-medium">TypeScript</span>

            <img className="w-8 h-8" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg" />
          
                      
                    </div>
                    <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Vercel</span>
                      
            <img className="w-8 h-8" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-line-wordmark.svg" />
          
                    </div>
                    <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Supabase</span>
                    
            <img className="w-8 h-8" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-plain-wordmark.svg" />
          
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-sky-300 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-sky-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-100 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                Fitelier
              </span>
            </div>
            
            <div className="flex gap-8">
              <a href="#" className="text-gray-600 hover:text-sky-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-sky-600 transition-colors">Terms</a>
              <a href="#" className="text-gray-600 hover:text-sky-600 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-sky-100 text-center text-gray-500">
            <p>&copy; 2025 Fitelier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
