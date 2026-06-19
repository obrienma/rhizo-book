---
title: "Building a Healthcare Scheduler: Calendar Views and Provider Search"
description: "How we built a dual-mode appointment calendar and location-aware provider search for RhizoBook — a full-stack Next.js + NestJS healthcare scheduling app."
pubDate: 2026-06-01
author: "Amanda O'Brien"
tags: ["nextjs", "nestjs", "react", "prisma", "typescript", "healthcare"]
---

When I set out to build RhizoBook — a healthcare appointment scheduling app — two features turned out to be more interesting than I expected: the appointment calendar and the provider search. Both look simple on the surface. Both had sharp edges underneath.

## The Appointment Calendar

Patients need to see their upcoming appointments. The obvious question: list or calendar?

A list is easier to build. A calendar is easier to understand at a glance. I wanted both, so I built a toggle.

### react-big-calendar and the CSS problem

The calendar view uses [react-big-calendar](https://github.com/jquense/react-big-calendar), a mature React library that renders a full monthly/weekly/daily calendar grid. Integration is straightforward — you pass it an array of events with `start`, `end`, and `title` fields, pick a date localizer, and it handles the rest.

```tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enCA } from 'date-fns/locale';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-CA': enCA },
});
```

The catch: react-big-calendar ships its own CSS that you have to import separately. In a Next.js App Router project with Turbopack, importing it directly inside a component causes a build error. The fix is to import the stylesheet in your global CSS file instead:

```css
/* app/globals.css */
@import 'react-big-calendar/lib/css/react-big-calendar.css';
```

It's a one-liner, but it took me longer than I'd like to admit to find it.

### Mapping appointments to calendar events

Appointments from the API carry a `dateTime` (ISO 8601 string), a `duration` (minutes), and a provider name. Converting them to calendar events means computing the end time:

```tsx
const events = appointments.map((appt) => ({
  title: `Dr. ${appt.provider.name}`,
  start: new Date(appt.dateTime),
  end: new Date(new Date(appt.dateTime).getTime() + appt.provider.providerProfile.appointmentDuration * 60000),
  resource: appt,
}));
```

The `resource` field is react-big-calendar's escape hatch for attaching arbitrary data to an event — useful for rendering a custom event component with extra detail.

### The List/Calendar toggle

The toggle state lives in a single `useState` boolean. Both views consume the same `appointments` array fetched once on mount. No refetch, no duplicated state — just a conditional render:

```tsx
const [view, setView] = useState<'list' | 'calendar'>('list');

return view === 'list'
  ? <AppointmentList appointments={appointments} />
  : <AppointmentCalendar appointments={appointments} />;
```

The list is the default because it loads faster on mobile and the calendar grid can feel overwhelming when you only have two appointments booked.

---

## Provider Search

Patients need to find a provider. The obvious question: what do they search by?

Specialty is the natural first filter — you know you need a cardiologist before you know which one. But specialty alone isn't enough. Healthcare is local. A cardiologist in Vancouver doesn't help a patient in Toronto.

### Adding city and province to the schema

The initial `ProviderProfile` model had `specialty` and `bio` but no location. Adding city and province was a Prisma migration:

```prisma
model ProviderProfile {
  // existing fields...
  city     String?
  province String?
}
```

I kept both nullable so existing seed data wouldn't break. The seed was updated to backfill realistic Canadian cities and province codes.

### Case-insensitive partial matching

The backend exposes `GET /v1/providers?specialty=&city=&province=`. Each filter is optional and uses Prisma's `contains` with `mode: 'insensitive'` — so "toronto", "Toronto", and "TORONTO" all work, and a partial match like "cardio" finds "Cardiology":

```typescript
async findAll(specialty?: string, city?: string, province?: string) {
  return this.prisma.user.findMany({
    where: {
      ...(specialty || city || province ? {
        providerProfile: {
          ...(specialty ? { specialty: { contains: specialty, mode: 'insensitive' } } : {}),
          ...(city      ? { city:      { contains: city,      mode: 'insensitive' } } : {}),
          ...(province  ? { province:  { contains: province,  mode: 'insensitive' } } : {}),
        },
      } : {}),
    },
    // select: { ... }
  });
}
```

One gotcha: if you spread multiple conditions into separate `providerProfile` keys at the same level, TypeScript will reject the duplicate keys — and even in plain JS, only the last one would apply. Everything has to be merged into a single `providerProfile` object.

### Syncing search state with the URL

Search state lives in the URL, not just in React state. When a user searches for cardiologists in Toronto, the URL becomes `/providers?specialty=Cardiology&city=Toronto`. This means:

- The page is shareable and bookmarkable
- Hitting back restores the search
- The `useEffect` that fetches providers is keyed to `searchParams`, not to local state

```tsx
useEffect(() => {
  const specialty = searchParams.get('specialty') ?? '';
  const city      = searchParams.get('city') ?? '';
  const province  = searchParams.get('province') ?? '';
  setSpecialtyInput(specialty);
  setCityInput(city);
  setProvinceInput(province);
  fetchProviders(specialty, city, province);
}, [searchParams, fetchProviders]);
```

All three state updates and the fetch happen in a single effect pass. Splitting them into separate effects would trigger multiple renders for a single URL change.

### Public access without auth

Provider search is intentionally unauthenticated. Patients shouldn't need to create an account just to see who's available. The NestJS controller for providers has no `@UseGuards(JwtAuthGuard)` decorator — since guards are applied per-controller rather than globally, omitting it is enough.

To avoid leaking sensitive fields, the query uses an explicit Prisma `select` rather than `include`. Any new column added to the schema is excluded by default rather than exposed automatically.

---

## The Booking Flow

These two features connect through a deliberate UX path: a patient searches for a provider by specialty and city, clicks through to the provider's detail page, and sees their weekly availability. If they're not logged in, they see a prompt to sign in or create an account — with a `callbackUrl` parameter so they land back on that provider's page after auth, not on a generic dashboard.

The full journey: search → browse → authenticate → book. No dead ends.

---

RhizoBook is built with Next.js 16 on the frontend, NestJS on the backend, Prisma + Neon PostgreSQL for the database, and deployed on Vercel + Railway. The source is on GitHub.
