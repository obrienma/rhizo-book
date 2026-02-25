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
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors mb-4 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Providers
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Book an Appointment</h1>
          <p className="text-slate-500 font-medium mt-1">Select a comfortable time for your visit with Dr. {provider.name}.</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Provider info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border border-green-50 shadow-xl shadow-emerald-900/5 bg-white overflow-hidden">
            <div className="bg-slate-50/50 p-8 border-b border-green-50">
              <div className="w-20 h-20 bg-white border border-green-100 rounded-3xl flex items-center justify-center text-4xl shadow-sm mb-6">👨‍⚕️</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">
                {provider.providerProfile?.specialty ?? 'General Practice'}
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dr. {provider.name}</h2>
            </div>
            <CardContent className="p-8 space-y-6">
              {provider.providerProfile?.bio && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">ABOUT PROVIDER</div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{provider.providerProfile.bio}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-100/50">
                <span className="text-sm font-bold text-teal-900">Appointment Duration</span>
                <span className="px-4 py-1 bg-white rounded-full text-xs font-black text-teal-600 shadow-sm border border-teal-100">
                  {provider.providerProfile?.appointmentDuration ?? 30} MIN
                </span>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">WEEKLY AVAILABILITY</div>
                {provider.providerProfile?.availabilitySlots.length ? (
                  <div className="grid gap-2">
                    {provider.providerProfile.availabilitySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="w-24 font-bold text-slate-400">{DAY_NAMES[slot.dayOfWeek]}</span>
                        <span className="font-semibold text-slate-700">{slot.startTime} – {slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No availability slots configured.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking form */}
        <div className="lg:col-span-3">
          <Card className="rounded-[3rem] border-2 border-teal-100 shadow-2xl shadow-emerald-900/10 bg-white p-2">
            <div className="bg-[#164E63] rounded-[2.5rem] p-8 md:p-10">
              <h3 className="text-2xl font-black text-white mb-8">Schedule your visit</h3>

              <div className="space-y-8">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                    1. Select a Date
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      min={todayIso}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                      }}
                      className="bg-white/10 border-white/20 text-white font-bold h-14 rounded-2xl [color-scheme:dark] px-6 focus:ring-teal-400"
                    />
                  </div>
                </div>

                {/* Time Picker */}
                {selectedDate && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                      2. Choose an Available Time
                    </Label>
                    {timeslots.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <p className="text-white/60 font-medium">
                          No slots available on this day.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {timeslots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`h-12 rounded-xl text-sm font-black transition-all ${
                              selectedTime === time
                                ? 'bg-teal-400 text-[#164E63] shadow-lg shadow-teal-400/20'
                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                    3. Additional Information
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Reason for visit..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/10 border-white/20 text-white font-semibold h-14 rounded-2xl placeholder:text-white/30 px-6 focus:ring-teal-400"
                  />
                </div>

                <Button
                  className="w-full h-16 rounded-[1.5rem] bg-teal-400 text-[#164E63] text-lg font-black hover:bg-white hover:scale-[1.02] transition-all shadow-xl shadow-teal-900/40 disabled:opacity-50 disabled:hover:scale-100 mt-4"
                  disabled={!selectedDate || !selectedTime || booking}
                  onClick={handleBook}
                >
                  {booking ? 'Confirming...' : 'Complete Booking'}
                </Button>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    Secure 128-bit Encrypted Booking
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
