'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Provider {
  id: number;
  name: string;
  email: string;
  providerProfile: {
    specialty: string;
    bio: string;
  };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.get('/providers');
        setProviders(response.data);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Healthcare Providers</h1>
        <p className="text-slate-500 font-medium mt-1">Connect with our network of experienced specialists.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">Finding best-in-class care...</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="rounded-[2.5rem] border border-green-50 shadow-xl shadow-emerald-900/5 hover:shadow-emerald-900/10 transition-all overflow-hidden bg-white flex flex-col group">
              <CardHeader className="p-8 pb-4">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">👨‍⚕️</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">
                  {provider.providerProfile?.specialty || 'General Practice'}
                </div>
                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  Dr. {provider.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                {provider.providerProfile?.bio && (
                  <p className="mb-8 text-sm text-slate-500 font-medium flex-1">
                    {provider.providerProfile.bio.substring(0, 120)}...
                  </p>
                )}
                <Link href={`/providers/${provider.id}`}>
                  <Button className="w-full py-6 rounded-2xl bg-[#164E63] text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-teal-900/10 active:scale-95">
                    View Availability
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
