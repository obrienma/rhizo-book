'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Provider {
  id: number;
  name: string;
  providerProfile: {
    specialty: string;
    bio: string;
    city: string | null;
    province: string | null;
    appointmentDuration: number;
  } | null;
}

function ProvidersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialtyInput, setSpecialtyInput] = useState(searchParams.get('specialty') ?? '');
  const [cityInput, setCityInput] = useState(searchParams.get('city') ?? '');
  const [provinceInput, setProvinceInput] = useState(searchParams.get('province') ?? '');

  const fetchProviders = useCallback(async (specialty: string, city: string, province: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialty) params.set('specialty', specialty);
      if (city) params.set('city', city);
      if (province) params.set('province', province);
      const qs = params.size ? `?${params}` : '';
      const res = await axios.get(`/v1/providers${qs}`);
      setProviders(res.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const specialty = searchParams.get('specialty') ?? '';
    const city = searchParams.get('city') ?? '';
    const province = searchParams.get('province') ?? '';
    setSpecialtyInput(specialty);
    setCityInput(city);
    setProvinceInput(province);
    fetchProviders(specialty, city, province);
  }, [searchParams, fetchProviders]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialtyInput.trim()) params.set('specialty', specialtyInput.trim());
    if (cityInput.trim()) params.set('city', cityInput.trim());
    if (provinceInput.trim()) params.set('province', provinceInput.trim());
    router.push(`/providers${params.size ? `?${params}` : ''}`);
  };

  const activeSpecialty = searchParams.get('specialty');
  const activeCity = searchParams.get('city');
  const activeProvince = searchParams.get('province');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Healthcare Providers</h1>
        <p className="text-slate-500 font-medium mt-1">Connect with our network of experienced specialists.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-10 flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-2xl border border-green-100 shadow-sm flex items-center px-5 gap-3">
            <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Search by specialty (e.g. Cardiology)"
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 font-semibold text-slate-700 placeholder:text-slate-300 h-14 px-0"
            />
            {specialtyInput && (
              <button
                type="button"
                onClick={() => setSpecialtyInput('')}
                className="text-slate-300 hover:text-slate-500 transition shrink-0"
                aria-label="Clear specialty"
              >
                ✕
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="px-8 h-14 rounded-2xl bg-[#2DD4BF] hover:bg-teal-500 text-[#164E63] font-black shadow-lg active:scale-95 transition-all"
          >
            Search
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-2xl border border-green-100 shadow-sm flex items-center px-5 gap-3">
            <Input
              type="text"
              placeholder="City (e.g. Toronto)"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 font-semibold text-slate-700 placeholder:text-slate-300 h-14 px-0"
            />
            {cityInput && (
              <button type="button" onClick={() => setCityInput('')} className="text-slate-300 hover:text-slate-500 transition shrink-0" aria-label="Clear city">✕</button>
            )}
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-green-100 shadow-sm flex items-center px-5 gap-3">
            <Input
              type="text"
              placeholder="Province (e.g. ON)"
              value={provinceInput}
              onChange={(e) => setProvinceInput(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 font-semibold text-slate-700 placeholder:text-slate-300 h-14 px-0"
            />
            {provinceInput && (
              <button type="button" onClick={() => setProvinceInput('')} className="text-slate-300 hover:text-slate-500 transition shrink-0" aria-label="Clear province">✕</button>
            )}
          </div>
        </div>
      </form>

      {(activeSpecialty || activeCity || activeProvince) && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-slate-500">
            Showing results for:
          </span>
          {activeSpecialty && (
            <span className="px-4 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-sm font-black text-teal-700">
              {activeSpecialty}
            </span>
          )}
          {activeCity && (
            <span className="px-4 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-sm font-black text-teal-700">
              {activeCity}
            </span>
          )}
          {activeProvince && (
            <span className="px-4 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-sm font-black text-teal-700">
              {activeProvince}
            </span>
          )}
          <button
            onClick={() => router.push('/providers')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">Finding best-in-class care...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-bold text-lg text-slate-600">No providers found</p>
          {(activeSpecialty || activeCity || activeProvince) && (
            <p className="text-sm mt-2 font-medium">
              No providers match your filters.{' '}
              <button onClick={() => router.push('/providers')} className="text-teal-600 font-bold hover:underline">
                View all providers
              </button>
            </p>
          )}
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
                {(provider.providerProfile?.city || provider.providerProfile?.province) && (
                  <p className="text-xs font-semibold text-slate-400 mb-3">
                    {[provider.providerProfile.city, provider.providerProfile.province].filter(Boolean).join(', ')}
                  </p>
                )}
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

export default function ProvidersPage() {
  return (
    <Suspense>
      <ProvidersContent />
    </Suspense>
  );
}
