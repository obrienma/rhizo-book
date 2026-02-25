'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import Logo from '@/components/auth/logo';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setError('root', { message: 'Incorrect email or password. Please try again.' });
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0FDF4] px-4 py-12 font-sans selection:bg-teal-100">
      <div className="w-full max-w-md">
        {/* Logo — click to return home */}
        <Link href="/" className="block mb-8">
          <Logo />
        </Link>

        <Card className="rounded-[2rem] border border-green-50 shadow-xl shadow-emerald-900/10">
          <CardHeader className="pb-2 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-2xl mx-auto mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Sign in to manage your appointments.
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {errors.root && (
                <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
                  <span className="mt-0.5 text-base">🔒</span>
                  <p className="text-sm font-semibold text-red-600">{errors.root.message}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  autoComplete="email"
                  className="font-semibold text-slate-800 placeholder:text-slate-300"
                  suppressHydrationWarning
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="font-semibold text-slate-800 placeholder:text-slate-300"
                  suppressHydrationWarning
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                suppressHydrationWarning
                className="w-full bg-[#2DD4BF] hover:bg-teal-500 text-[#164E63] font-black rounded-2xl py-6 text-base shadow-lg active:scale-95 transition-all"
              >
                {isSubmitting ? 'Signing in…' : 'SIGN IN'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-teal-600 font-bold hover:underline">
                Register
              </Link>
            </p>

            <div className="mt-5 pt-5 border-t border-green-50 text-center">
              <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-teal-600 transition">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-400">
          © 2026 RhizoBook. Hosted on CyberRhizome.ca
        </p>
      </div>
    </div>
  );
}
