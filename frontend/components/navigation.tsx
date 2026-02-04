'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Navigation() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-lg font-bold">
            Health Scheduler
          </Link>
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
          {session.user.roleName === 'patient' && (
            <Link href="/providers" className="text-sm hover:underline">
              Providers
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{session.user.name}</span>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
