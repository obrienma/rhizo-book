'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AvailabilitySlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Provider {
  id: number;
  name: string;
  email: string;
  providerProfile: {
    specialty: string | null;
    bio: string | null;
    appointmentDuration: number;
    availabilitySlots: AvailabilitySlot[];
  } | null;
}

function generateTimeSlots(
  slotStart: string,
  slotEnd: string,
  durationMinutes: number,
): string[] {
  const times: string[] = [];
  const [startH, startM] = slotStart.split(':').map(Number);
  const [endH, endM] = slotEnd.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    times.push(`${h}:${m}`);
    current += durationMinutes;
  }
  return times;
}

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await api.get(`/providers/${id}`);
        setProvider(res.data);
      } catch {
        toast.error('Provider not found');
        router.push('/providers');
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id, router]);

  const availableTimesForDate = (): string[] => {
    if (!selectedDate || !provider?.providerProfile) return [];
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();
    const duration = provider.providerProfile.appointmentDuration;
    const slots = provider.providerProfile.availabilitySlots.filter(
      (s) => s.dayOfWeek === dayOfWeek,
    );
    return slots.flatMap((s) => generateTimeSlots(s.startTime, s.endTime, duration));
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !provider) return;
    const duration = provider.providerProfile?.appointmentDuration ?? 30;
    const startTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const endMs = new Date(`${selectedDate}T${selectedTime}:00`).getTime() + duration * 60 * 1000;
    const endTime = new Date(endMs).toISOString();

    setBooking(true);
    try {
      await api.post('/appointments', {
        providerId: provider.id,
        startTime,
        endTime,
        notes: notes || undefined,
      });
      toast.success('Appointment booked successfully!');
      router.push('/appointments');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to book appointment';
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!provider) return null;

  const timeslots = availableTimesForDate();
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Provider info */}
        <Card>
          <CardHeader>
            <CardTitle>Dr. {provider.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Specialty: </span>
              {provider.providerProfile?.specialty ?? 'General Practice'}
            </p>
            {provider.providerProfile?.bio && (
              <p className="text-sm">{provider.providerProfile.bio}</p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Appointment duration: </span>
              {provider.providerProfile?.appointmentDuration ?? 30} minutes
            </p>

            <div className="pt-2">
              <p className="mb-2 text-sm font-medium">Availability</p>
              {provider.providerProfile?.availabilitySlots.length ? (
                <ul className="space-y-1 text-sm text-gray-600">
                  {provider.providerProfile.availabilitySlots.map((slot) => (
                    <li key={slot.id}>
                      {DAY_NAMES[slot.dayOfWeek]}: {slot.startTime} – {slot.endTime}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No availability configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking form */}
        <Card>
          <CardHeader>
            <CardTitle>Book an Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                min={todayIso}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="mt-1"
              />
            </div>

            {selectedDate && (
              <div>
                <Label>Select Time</Label>
                {timeslots.length === 0 ? (
                  <p className="mt-1 text-sm text-gray-500">
                    No available slots on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                  </p>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {timeslots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                          selectedTime === time
                            ? 'border-transparent bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Reason for visit, symptoms, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              className="w-full"
              disabled={!selectedDate || !selectedTime || booking}
              onClick={handleBook}
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
