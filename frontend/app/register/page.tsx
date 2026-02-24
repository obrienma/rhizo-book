'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import api from '@/lib/api';

const registerSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Logo = () => (
  <div className="flex items-center gap-2 justify-center">
    <div className="w-10 h-10 bg-[#164E63] rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/10">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="3" fill="#2DD4BF" />
        <circle cx="10" cy="22" r="3" fill="#2DD4BF" />
        <circle cx="22" cy="22" r="3" fill="#2DD4BF" />
        <path d="M16 10L10 22M16 10L22 22M10 22L22 22" stroke="#2DD4BF" strokeWidth="2" />
      </svg>
    </div>
    <span className="text-2xl font-bold tracking-tight text-slate-800">
      Rhizo<span className="text-[#2DD4BF]">Book</span>
    </span>
  </div>
);

export default function PatientRegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await api.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
        roleId: 2, // patient
      });

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Account created — please sign in.');
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;
      toast.error(
        Array.isArray(message) ? message.join(', ') : (message ?? 'Registration failed. Please try again.')
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0FDF4] px-4 font-sans selection:bg-teal-100">
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
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-400">
          © 2026 RhizoBook. Hosted on CyberRhizome.ca
        </p>
      </div>
    </div>
  );
}
