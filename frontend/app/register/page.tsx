'use client';

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
import { baseRegisterSchema } from '@/lib/schemas/auth';
import { submitRegistration } from '@/lib/register';

const registerSchema = baseRegisterSchema;

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function PatientRegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: RegisterFormValues) => submitRegistration(values, 2, router);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0FDF4] px-4 py-12 font-sans selection:bg-teal-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block mb-8">
          <Logo />
        </Link>

        <Card className="rounded-[2rem] border border-green-50 shadow-xl shadow-emerald-900/10">
          <CardHeader className="pb-2 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-2xl mx-auto mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Join the network and find care in seconds.
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className="font-semibold text-slate-800 placeholder:text-slate-300"
                  suppressHydrationWarning
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="font-semibold text-slate-800 placeholder:text-slate-300"
                  suppressHydrationWarning
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="font-semibold text-slate-800 placeholder:text-slate-300"
                  suppressHydrationWarning
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                suppressHydrationWarning
                className="w-full bg-[#2DD4BF] hover:bg-teal-500 text-[#164E63] font-black rounded-2xl py-6 text-base shadow-lg active:scale-95 transition-all"
              >
                {isSubmitting ? 'Creating account…' : 'JOIN THE NETWORK'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-600 font-bold hover:underline">
                Sign in
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
