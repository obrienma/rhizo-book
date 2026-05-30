export interface AppointmentUser {
  id: number;
  name: string;
  email: string;
}

export interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string | null;
  cancellationReason: string | null;
  provider: AppointmentUser;
  patient: AppointmentUser;
}
