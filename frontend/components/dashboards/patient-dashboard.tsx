'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  provider: {
    name: string;
    email: string;
  };
}

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments');
        setAppointments(
          response.data
            .filter((apt: Appointment) => apt.status === 'SCHEDULED')
            .sort((a: Appointment, b: Appointment) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            )
            .slice(0, 5)
        );
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Patient Dashboard</h1>
      <p className="mb-6 text-gray-600">Welcome, {session?.user?.name}</p>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Appointments</CardTitle>
            <Link href="/providers">
              <Button>Book Appointment</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Dr. {appointment.provider.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.startTime).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
