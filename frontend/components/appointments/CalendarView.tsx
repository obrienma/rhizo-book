'use client';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enCA } from 'date-fns/locale';
import { Appointment } from '@/lib/types';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-CA': enCA },
});

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: '#2DD4BF', text: '#164E63' },
  COMPLETED: { bg: '#94a3b8', text: '#fff' },
  CANCELLED: { bg: '#fca5a5', text: '#991b1b' },
  NO_SHOW:   { bg: '#fdba74', text: '#9a3412' },
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

interface Props {
  appointments: Appointment[];
  role: string;
}

export default function CalendarView({ appointments, role }: Props) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);

  const events: CalendarEvent[] = appointments.map((appt) => ({
    id: appt.id,
    title: role === 'provider' ? appt.patient.name : `Dr. ${appt.provider.name}`,
    start: new Date(appt.startTime),
    end: new Date(appt.endTime),
    resource: appt,
  }));

  const eventPropGetter = (event: CalendarEvent) => {
    const colors = STATUS_COLORS[event.resource.status] ?? STATUS_COLORS.SCHEDULED;
    return {
      style: {
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '0.7rem',
        fontWeight: '700',
        padding: '2px 6px',
      },
    };
  };

  return (
    <div>
      {/* Color legend */}
      <div className="mb-6 flex flex-wrap gap-4">
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colors.bg }} />
            <span className="text-xs font-semibold text-slate-500">{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-green-50 shadow-xl shadow-emerald-900/5 p-6" style={{ height: 640 }}>
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          views={['month', 'week']}
          eventPropGetter={eventPropGetter}
          onSelectEvent={(event) => setSelected(event.resource)}
          onSelectSlot={(_slot: SlotInfo) => setSelected(null)}
          selectable
          popup
          style={{ height: '100%' }}
        />
      </div>

      {/* Selected event detail */}
      {selected && (
        <div className="mt-6 bg-white rounded-[2rem] border border-green-50 shadow-xl shadow-emerald-900/5 overflow-hidden">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-green-50">
            <div className="p-8 md:w-64 bg-slate-50/50 flex flex-col justify-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-2">DATE &amp; TIME</div>
              <div className="text-lg font-black text-slate-800 leading-tight">
                {new Date(selected.startTime).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </div>
              <div className="text-slate-500 font-bold mt-1">
                {new Date(selected.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' – '}
                {new Date(selected.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white border border-green-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                  {role === 'provider' ? '👤' : '👨‍⚕️'}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">
                    {role === 'provider' ? 'PATIENT' : 'PROVIDER'}
                  </div>
                  <h3 className="text-xl font-black text-slate-800">
                    {role === 'provider' ? selected.patient.name : `Dr. ${selected.provider.name}`}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {role === 'provider' ? selected.patient.email : selected.provider.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-4">
                <span
                  className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase"
                  style={{
                    backgroundColor: STATUS_COLORS[selected.status]?.bg ?? '#2DD4BF',
                    color: STATUS_COLORS[selected.status]?.text ?? '#164E63',
                  }}
                >
                  {selected.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          {(selected.notes || selected.cancellationReason) && (
            <div className="px-8 pb-8 pt-0 flex flex-col gap-2">
              {selected.notes && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Notes</span>
                  <p className="text-sm font-medium text-slate-600">{selected.notes}</p>
                </div>
              )}
              {selected.cancellationReason && (
                <div className="bg-red-50/50 rounded-xl p-4 border border-red-100/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-1">Cancellation Reason</span>
                  <p className="text-sm font-medium text-red-600 italic">&ldquo;{selected.cancellationReason}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
