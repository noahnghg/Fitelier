'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { profileService } from '@/lib/database';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Profile will be created automatically by the database trigger
        // No need for manual profile creation
        
        // Check if email confirmation is required
        if (data.session) {
          // User is automatically logged in (email confirmation disabled)
          router.push('/protected/main');
        } else {
          // Email confirmation required
          setSuccess(true);
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-linear-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center shadow-lg">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Fitelier
            </span>
          </Link>
        </div>

        {success ? (
          <Card className="shadow-xl border-sky-100">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-green-600">Check your email!</CardTitle>
              <CardDescription className="text-center">
                We've sent you a confirmation link to {formData.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Click the link in your email to confirm your account and start your fitness journey.
                </p>
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-sky-100">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Start your fitness journey with AI-powered coaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>

              <p className="text-xs text-center text-gray-500">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-sky-600 hover:text-sky-700">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-sky-600 hover:text-sky-700">
                  Privacy Policy
                </Link>
              </p>
            </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-sky-600 hover:text-sky-700 font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
