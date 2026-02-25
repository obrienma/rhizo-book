'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';
import Logo from './auth/logo';

export default function Navigation() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="transition hover:opacity-90">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/appointments"
                className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition"
              >
                Appointments
              </Link>
              {session.user.roleName === 'patient' && (
                <Link
                  href="/providers"
                  className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition"
                >
                  Find Care
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black uppercase tracking-widest text-teal-600">
                {session.user.roleName}
              </span>
              <span className="text-sm font-bold text-slate-700">{session.user.name}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-6 py-2.5 rounded-full border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
