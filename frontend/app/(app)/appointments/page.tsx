'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string | null;
  cancellationReason: string | null;
  provider: { id: number; name: string; email: string };
  patient: { id: number; name: string; email: string };
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-yellow-100 text-yellow-800',
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const isProvider = session?.user?.roleName === 'provider';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('SCHEDULED');

  // Cancel dialog state
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    if (cancelId === null) return;
    setCancelling(true);
    try {
      await api.patch(`/appointments/${cancelId}/cancel`, { reason: cancelReason || undefined });
      toast.success('Appointment cancelled');
      setCancelId(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to cancel appointment';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const displayed = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your healthcare schedule.</p>
        </div>
        {!isProvider && (
          <Link href="/providers">
            <Button className="px-8 py-6 rounded-2xl bg-[#164E63] text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-teal-900/10 active:scale-95">
              Book New Appointment
            </Button>
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              filter === s
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-500 hover:bg-teal-50 border border-green-50'
            }`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">Syncing your schedule...</p>
        </div>
      ) : displayed.length === 0 ? (
        <Card className="rounded-[2.5rem] border border-green-50 shadow-xl shadow-emerald-900/5 bg-white/50 backdrop-blur-sm py-20">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center text-4xl mb-6">🗓️</div>
            <h3 className="text-xl font-bold text-slate-800">No appointments found</h3>
            <p className="text-slate-500 mt-2 max-w-xs">
              {!isProvider ? (
                <>Try adjusting your filters or <Link href="/providers" className="text-teal-600 underline font-bold">book a new appointment</Link> to get started.</>
              ) : (
                <>Try adjusting your filters to see more appointments.</>
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {displayed.map((appt) => (
            <Card key={appt.id} className="rounded-[2rem] border border-green-50 shadow-xl shadow-emerald-900/5 hover:shadow-emerald-900/10 transition-all overflow-hidden bg-white group">
              <CardContent className="p-0 text-slate-600">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-green-50">
                  {/* Time Info */}
                  <div className="p-8 md:w-64 bg-slate-50/50 flex flex-col justify-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-2">DATE & TIME</div>
                    <div className="text-lg font-black text-slate-800 leading-tight">
                      {new Date(appt.startTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-slate-500 font-bold mt-1">
                      {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white border border-green-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                        {isProvider ? '👤' : '👨‍⚕️'}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">
                          {isProvider ? 'PATIENT' : 'PROVIDER'}
                        </div>
                        <h3 className="text-xl font-black text-slate-800">
                          {isProvider ? appt.patient.name : `Dr. ${appt.provider.name}`}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">{isProvider ? appt.patient.email : appt.provider.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${STATUS_STYLES[appt.status] ?? ''}`}>
                        {appt.status}
                      </span>
                      {appt.status === 'SCHEDULED' && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setCancelId(appt.id);
                            setCancelReason('');
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm px-4"
                        >
                          Cancel Appointment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {(appt.notes || appt.cancellationReason) && (
                  <div className="px-8 pb-8 pt-0 flex flex-col gap-2">
                    {appt.notes && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Notes</span>
                        <p className="text-sm font-medium text-slate-600">{appt.notes}</p>
                      </div>
                    )}
                    {appt.cancellationReason && (
                      <div className="bg-red-50/50 rounded-xl p-4 border border-red-100/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-1">Cancellation Reason</span>
                        <p className="text-sm font-medium text-red-600 italic">"{appt.cancellationReason}"</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-md">
          <DialogHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
            <DialogTitle className="text-2xl font-black text-slate-900">Cancel Appointment?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                Reason (optional)
              </Label>
              <Input
                id="cancel-reason"
                placeholder="e.g. Schedule conflict"
                className="font-semibold text-slate-800 placeholder:text-slate-300"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <p className="text-sm text-slate-500 font-medium text-center">
              Are you sure you want to cancel? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-red-900/10"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCancelId(null)}
              disabled={cancelling}
              className="w-full py-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50"
            >
              No, Keep It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
