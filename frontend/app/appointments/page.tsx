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
  const [filter, setFilter] = useState<string>('ALL');

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
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointments</h1>
        {!isProvider && (
          <Link href="/providers">
            <Button>Book New Appointment</Button>
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No appointments found.{' '}
            {!isProvider && (
              <Link href="/providers" className="text-primary underline">
                Book one now
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayed.map((appt) => (
            <Card key={appt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold">
                    {isProvider ? appt.patient.name : `Dr. ${appt.provider.name}`}
                  </CardTitle>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[appt.status] ?? ''}`}
                  >
                    {appt.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Time: </span>
                  {new Date(appt.startTime).toLocaleString()} –{' '}
                  {new Date(appt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {appt.notes && (
                  <p>
                    <span className="font-medium">Notes: </span>
                    {appt.notes}
                  </p>
                )}
                {appt.cancellationReason && (
                  <p>
                    <span className="font-medium">Cancellation reason: </span>
                    {appt.cancellationReason}
                  </p>
                )}
                {appt.status === 'SCHEDULED' && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setCancelId(appt.id);
                        setCancelReason('');
                      }}
                    >
                      Cancel Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Input
              id="cancel-reason"
              placeholder="e.g. Schedule conflict"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)} disabled={cancelling}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
