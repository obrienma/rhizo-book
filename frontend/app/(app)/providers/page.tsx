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
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Healthcare Providers</h1>

      {loading ? (
        <p>Loading providers...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <CardTitle>Dr. {provider.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-gray-600">
                  {provider.providerProfile?.specialty || 'General Practice'}
                </p>
                {provider.providerProfile?.bio && (
                  <p className="mb-4 text-sm">
                    {provider.providerProfile.bio.substring(0, 100)}...
                  </p>
                )}
                <Link href={`/providers/${provider.id}`}>
                  <Button className="w-full">View Availability</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
