import { PrismaClient, AppointmentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Roles ────────────────────────────────────────────────────────────────
  const providerRole = await prisma.role.upsert({
    where: { name: 'provider' },
    update: {},
    create: { name: 'provider' },
  });

  const patientRole = await prisma.role.upsert({
    where: { name: 'patient' },
    update: {},
    create: { name: 'patient' },
  });

  console.log('✅ Roles ready');

  const hash = await bcrypt.hash('password123', 10);

  // ── Providers ────────────────────────────────────────────────────────────
  const providerSeeds = [
    {
      email: 'sarah.johnson@clinic.com',
      name: 'Sarah Johnson',
      specialty: 'Family Medicine',
      bio: 'Board-certified family physician with 12 years of experience treating patients of all ages.',
      licenseNumber: 'MD-10021-CA',
      appointmentDuration: 30,
      // Mon–Fri 9am–5pm
      slots: [1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00' })),
    },
    {
      email: 'mike.chen@clinic.com',
      name: 'Mike Chen',
      specialty: 'Cardiology',
      bio: 'Interventional cardiologist specialising in preventive care and heart disease management.',
      licenseNumber: 'MD-20847-NY',
      appointmentDuration: 45,
      // Tue / Thu / Sat mornings
      slots: [
        { dayOfWeek: 2, startTime: '08:00', endTime: '13:00' },
        { dayOfWeek: 4, startTime: '08:00', endTime: '13:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '12:00' },
      ],
    },
    {
      email: 'priya.patel@clinic.com',
      name: 'Priya Patel',
      specialty: 'Pediatrics',
      bio: 'Dedicated pediatrician focused on child wellness, vaccinations, and developmental health.',
      licenseNumber: 'MD-33761-TX',
      appointmentDuration: 20,
      // Mon / Wed / Fri full day
      slots: [
        { dayOfWeek: 1, startTime: '08:30', endTime: '16:30' },
        { dayOfWeek: 3, startTime: '08:30', endTime: '16:30' },
        { dayOfWeek: 5, startTime: '08:30', endTime: '12:30' },
      ],
    },
  ];

  const providers: { userId: number; profileId: number; duration: number }[] = [];

  for (const seed of providerSeeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {},
      create: {
        email: seed.email,
        name: seed.name,
        password: hash,
        roleId: providerRole.id,
      },
    });

    const profile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialty: seed.specialty,
        bio: seed.bio,
        licenseNumber: seed.licenseNumber,
        appointmentDuration: seed.appointmentDuration,
      },
    });

    // Remove stale slots then recreate (idempotent)
    await prisma.availabilitySlot.deleteMany({ where: { providerId: profile.id } });
    await prisma.availabilitySlot.createMany({
      data: seed.slots.map((s) => ({
        providerId: profile.id, // ← ProviderProfile.id, not User.id
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: true,
      })),
    });

    providers.push({ userId: user.id, profileId: profile.id, duration: seed.appointmentDuration });
    console.log(`✅ Provider: ${seed.name} (${seed.specialty})`);
  }

  // ── Patients ─────────────────────────────────────────────────────────────
  const patientSeeds = [
    {
      email: 'alice.smith@email.com',
      name: 'Alice Smith',
      dateOfBirth: new Date('1990-03-22'),
      phone: '+1-555-867-5309',
      medicalNotes: 'Mild hypertension, takes lisinopril 10mg daily. No known drug allergies.',
    },
    {
      email: 'james.nguyen@email.com',
      name: 'James Nguyen',
      dateOfBirth: new Date('1985-11-08'),
      phone: '+1-555-234-7890',
      medicalNotes: 'Type 2 diabetes, well-controlled. Annual cardiology follow-up required.',
    },
    {
      email: 'emma.wilson@email.com',
      name: 'Emma Wilson',
      dateOfBirth: new Date('2018-06-30'),
      phone: '+1-555-321-4567',
      medicalNotes: 'Pediatric patient. Up to date on vaccinations. Mild seasonal allergies.',
    },
  ];

  const patientIds: number[] = [];

  for (const seed of patientSeeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {},
      create: {
        email: seed.email,
        name: seed.name,
        password: hash,
        roleId: patientRole.id,
      },
    });

    await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        dateOfBirth: seed.dateOfBirth,
        phone: seed.phone,
        medicalNotes: seed.medicalNotes,
      },
    });

    patientIds.push(user.id);
    console.log(`✅ Patient: ${seed.name}`);
  }

  // ── Appointments ─────────────────────────────────────────────────────────
  // Clear existing appointments so the seed is idempotent
  await prisma.appointment.deleteMany({});

  const now = new Date();
  const daysFromNow = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  const withHour = (date: Date, h: number, m = 0) => {
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  };

  // sarah (idx 0, 30 min) — alice (idx 0)
  const [sarah, mike, priya] = providers;
  const [aliceId, jamesId, emmaId] = patientIds;

  const appointmentData = [
    // ── Past / completed ──────────────────────────────────────────
    {
      providerId: sarah.userId,
      patientId: aliceId,
      startTime: withHour(daysFromNow(-14), 10),
      endTime:   withHour(daysFromNow(-14), 10, 30),
      status: AppointmentStatus.COMPLETED,
      notes: 'Annual physical. Blood pressure slightly elevated — monitor and recheck in 3 months.',
    },
    {
      providerId: mike.userId,
      patientId: jamesId,
      startTime: withHour(daysFromNow(-10), 8),
      endTime:   withHour(daysFromNow(-10), 8, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Cardiology follow-up. ECG normal. Recommended continued diet and exercise plan.',
    },
    {
      providerId: priya.userId,
      patientId: emmaId,
      startTime: withHour(daysFromNow(-7), 9),
      endTime:   withHour(daysFromNow(-7), 9, 20),
      status: AppointmentStatus.COMPLETED,
      notes: '6-year wellness visit. All vaccinations up to date. Growth on track.',
    },
    // ── Cancelled ─────────────────────────────────────────────────
    {
      providerId: sarah.userId,
      patientId: jamesId,
      startTime: withHour(daysFromNow(-3), 14),
      endTime:   withHour(daysFromNow(-3), 14, 30),
      status: AppointmentStatus.CANCELLED,
      notes: 'Routine checkup.',
      cancellationReason: 'Patient had a work conflict — rescheduled for next week.',
    },
    // ── Upcoming / scheduled ──────────────────────────────────────
    {
      providerId: sarah.userId,
      patientId: aliceId,
      startTime: withHour(daysFromNow(3), 10),
      endTime:   withHour(daysFromNow(3), 10, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Follow-up blood pressure check.',
    },
    {
      providerId: sarah.userId,
      patientId: jamesId,
      startTime: withHour(daysFromNow(3), 11),
      endTime:   withHour(daysFromNow(3), 11, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Diabetes management review.',
    },
    {
      providerId: mike.userId,
      patientId: aliceId,
      startTime: withHour(daysFromNow(7), 8),
      endTime:   withHour(daysFromNow(7), 8, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Cardiac screening requested by primary care.',
    },
    {
      providerId: priya.userId,
      patientId: emmaId,
      startTime: withHour(daysFromNow(10), 9),
      endTime:   withHour(daysFromNow(10), 9, 20),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Seasonal allergy review.',
    },
  ];

  await prisma.appointment.createMany({ data: appointmentData });
  console.log(`✅ ${appointmentData.length} appointments created`);

  console.log(`
🎉 Database seeded successfully!
`);
  console.log('─────────────────────────────────────────');
  console.log('Test credentials (all passwords: password123)');
  console.log('─────────────────────────────────────────');
  console.log('PROVIDERS');
  console.log('  sarah.johnson@clinic.com  — Family Medicine (30 min, Mon–Fri)');
  console.log('  mike.chen@clinic.com      — Cardiology (45 min, Tue/Thu/Sat)');
  console.log('  priya.patel@clinic.com    — Pediatrics (20 min, Mon/Wed/Fri)');
  console.log('PATIENTS');
  console.log('  alice.smith@email.com     — Alice Smith');
  console.log('  james.nguyen@email.com    — James Nguyen');
  console.log('  emma.wilson@email.com     — Emma Wilson');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
