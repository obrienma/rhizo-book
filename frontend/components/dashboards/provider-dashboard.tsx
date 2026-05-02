'use client';

import { useCallback, useEffect, useState } from 'react';
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
  status: string;
  patient: {
    name: string;
    email: string;
  };
}

export default function ProviderDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Provider Dashboard</h1>
        <p className="text-slate-500 font-medium mt-1">Welcome back, Dr. {session?.user?.name}. Here's your clinical schedule.</p>
      </div>

      <Card className="rounded-[2.5rem] border border-green-50 shadow-xl shadow-emerald-900/10 overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-50 rounded-2xl text-2xl mb-4 text-teal-600">
                👨‍⚕️
              </div>
              <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Upcoming Appointments</CardTitle>
              <p className="text-sm text-slate-500 font-medium mt-1">Patients scheduled for today and tomorrow.</p>
            </div>
            <Link href="/appointments">
              <Button variant="outline" className="px-6 py-2.5 rounded-full border-2 border-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Loading schedule...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">You have no upcoming appointments.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-white border border-green-50 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 transition-all">
                  <div className="flex items-center gap-5 w-full md:w-auto mb-4 md:mb-0">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex flex-col items-center justify-center text-teal-700 font-black shrink-0">
                      <span className="text-[10px] uppercase leading-none mb-0.5">
                        {new Date(appointment.startTime).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg leading-none">
                        {new Date(appointment.startTime).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">{appointment.patient.name}</h4>
                      <p className="text-sm text-slate-500 font-medium">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black tracking-widest uppercase">
                      {appointment.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setCancelId(appointment.id); setCancelReason(''); }}
                      className="flex-1 md:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-md">
          <DialogHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
            <DialogTitle className="text-2xl font-black text-slate-900">Cancel Appointment?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason-pvd" className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                Reason (optional)
              </Label>
              <Input
                id="cancel-reason-pvd"
                placeholder="e.g. Scheduling conflict"
                className="font-semibold text-slate-800 placeholder:text-slate-300"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <p className="text-sm text-slate-500 font-medium text-center">
              Are you sure you want to cancel this patient visit?
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
