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

const providerRegisterSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    specialty: z.string().optional(),
    bio: z.string().optional(),
    licenseNumber: z.string().optional(),
    appointmentDuration: z
      .union([z.literal(''), z.coerce.number().int().min(1, 'Must be at least 1 minute')])
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProviderRegisterFormValues = z.infer<typeof providerRegisterSchema>;

const OPTIONAL_PLACEHOLDER = 'You can update this from your profile later';

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

export default function ProviderRegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderRegisterFormValues>({
    resolver: zodResolver(providerRegisterSchema),
  });

  const onSubmit = async (values: ProviderRegisterFormValues) => {
    try {
      await api.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
        roleId: 1, // provider
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
    <div className="flex min-h-screen items-center justify-center bg-[#F0FDF4] px-4 py-12 font-sans selection:bg-teal-100">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="block mb-8">
          <Logo />
        </Link>

        <Card className="rounded-[2rem] border border-green-50 shadow-xl shadow-emerald-900/10">
          <CardHeader className="pb-2 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#164E63] rounded-2xl mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Join as a provider</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Set up your clinic profile and start accepting appointments.
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

              {/* ── Account ── */}
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 pt-1">
                Account
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. Jane Smith"
                  autoComplete="name"
                  className="font-semibold text-slate-800 placeholder:text-slate-300"
                  suppressHydrationWarning
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="dr.smith@clinic.com"
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

              {/* ── Practice Profile (optional) ── */}
              <div className="pt-2 border-t border-green-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-4">
                  Practice Profile <span className="normal-case font-medium text-slate-400">(optional)</span>
                </p>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="specialty" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                      Specialty
                    </Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder={OPTIONAL_PLACEHOLDER}
                      autoComplete="off"
                      className="font-semibold text-slate-800 placeholder:text-slate-300"
                      {...register('specialty')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                      Bio
                    </Label>
                    <Input
                      id="bio"
                      type="text"
                      placeholder={OPTIONAL_PLACEHOLDER}
                      autoComplete="off"
                      className="font-semibold text-slate-800 placeholder:text-slate-300"
                      {...register('bio')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="licenseNumber" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                      License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder={OPTIONAL_PLACEHOLDER}
                      autoComplete="off"
                      className="font-semibold text-slate-800 placeholder:text-slate-300"
                      {...register('licenseNumber')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="appointmentDuration" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                      Appointment Duration <span className="normal-case font-medium text-slate-400">(minutes)</span>
                    </Label>
                    <Input
                      id="appointmentDuration"
                      type="number"
                      min={1}
                      placeholder="30"
                      autoComplete="off"
                      className="font-semibold text-slate-800 placeholder:text-slate-300"
                      {...register('appointmentDuration')}
                    />
                    {errors.appointmentDuration && (
                      <p className="text-xs text-red-500 font-medium">{errors.appointmentDuration.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2DD4BF] hover:bg-teal-500 text-[#164E63] font-black rounded-2xl py-6 text-base shadow-lg active:scale-95 transition-all"
              >
                {isSubmitting ? 'Creating account…' : 'JOIN AS A PROVIDER'}
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
