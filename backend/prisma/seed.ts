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
      city: 'Toronto',
      province: 'ON',
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
      city: 'Vancouver',
      province: 'BC',
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
      city: 'Toronto',
      province: 'ON',
      licenseNumber: 'MD-33761-TX',
      appointmentDuration: 20,
      // Mon / Wed / Fri full day
      slots: [
        { dayOfWeek: 1, startTime: '08:30', endTime: '16:30' },
        { dayOfWeek: 3, startTime: '08:30', endTime: '16:30' },
        { dayOfWeek: 5, startTime: '08:30', endTime: '12:30' },
      ],
    },
    {
      email: 'david.miller@clinic.com',
      name: 'David Miller',
      specialty: 'Dermatology',
      bio: 'Expert in clinical and cosmetic dermatology, specialized in skin cancer prevention.',
      city: 'Calgary',
      province: 'AB',
      licenseNumber: 'MD-44021-FL',
      appointmentDuration: 20,
      slots: [1, 2, 3].map((d) => ({ dayOfWeek: d, startTime: '10:00', endTime: '18:00' })),
    },
    {
      email: 'elena.rodriguez@clinic.com',
      name: 'Elena Rodriguez',
      specialty: 'Neurology',
      bio: 'Specialist in neurological disorders, including migraines and sleep medicine.',
      city: 'Vancouver',
      province: 'BC',
      licenseNumber: 'MD-55928-WA',
      appointmentDuration: 40,
      slots: [2, 3, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '16:00' })),
    },
    {
      email: 'marcus.thorne@clinic.com',
      name: 'Marcus Thorne',
      specialty: 'Orthopedics',
      bio: 'Orthopedic surgeon focusing on sports medicine and joint replacements.',
      city: 'Ottawa',
      province: 'ON',
      licenseNumber: 'MD-66103-IL',
      appointmentDuration: 45,
      slots: [1, 3, 5].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '15:00' })),
    },
    {
      email: 'sophie.dubois@clinic.com',
      name: 'Sophie Dubois',
      specialty: 'Psychiatry',
      bio: 'Compassionate psychiatrist specializing in anxiety, depression, and child-adolescent psychiatry.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-77294-MA',
      appointmentDuration: 50,
      slots: [1, 2, 3, 4].map((d) => ({ dayOfWeek: d, startTime: '11:00', endTime: '19:00' })),
    },
    {
      email: 'kenji.sato@clinic.com',
      name: 'Kenji Sato',
      specialty: 'Ophthalmology',
      bio: 'Ophthalmologist expert in cataract surgery and glaucoma management.',
      city: 'Toronto',
      province: 'ON',
      licenseNumber: 'MD-88302-OR',
      appointmentDuration: 30,
      slots: [2, 4].map((d) => ({ dayOfWeek: d, startTime: '10:00', endTime: '17:00' })),
    },
    {
      email: 'jp.tremblay@clinic.com',
      name: 'Jean-Philippe Tremblay',
      specialty: 'Internal Medicine',
      bio: 'Specialiste en médecine interne avec un focus sur les soins préventifs et chroniques.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-91223-QC',
      appointmentDuration: 30,
      slots: [1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '16:00' })),
    },
    {
      email: 'marieeve.gagnon@clinic.com',
      name: 'Marie-Eve Gagnon',
      specialty: 'Gynecology',
      bio: 'Gynécologue-obstétricienne dédiée à la santé des femmes et aux soins prénataux.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-92334-QC',
      appointmentDuration: 30,
      slots: [1, 3, 5].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00' })),
    },
    {
      email: 'luc.lalonde@clinic.com',
      name: 'Luc Lalonde',
      specialty: 'Gastroenterology',
      bio: 'Expert en gastroentérologie et hépatologie, spécialisé dans les troubles digestifs.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-93445-QC',
      appointmentDuration: 40,
      slots: [2, 4].map((d) => ({ dayOfWeek: d, startTime: '08:30', endTime: '15:30' })),
    },
    {
      email: 'isabelle.fortin@clinic.com',
      name: 'Isabelle Fortin',
      specialty: 'Endocrinology',
      bio: 'Endocrinologue spécialisée dans le diabète et les troubles de la thyroïde.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-94556-QC',
      appointmentDuration: 30,
      slots: [1, 2, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '10:00', endTime: '18:00' })),
    },
    {
      email: 'guy.lefebvre@clinic.com',
      name: 'Guy Lefebvre',
      specialty: 'Urology',
      bio: 'Urologue certifié avec expertise en chirurgie minimalement invasive.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-95667-QC',
      appointmentDuration: 45,
      slots: [3, 5].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '14:00' })),
    },
    {
      email: 'thomas.baker@clinic.com',
      name: 'Thomas Baker',
      specialty: 'Oncology',
      bio: 'Compassionate oncologist specializing in personalized cancer treatment plans.',
      city: 'Calgary',
      province: 'AB',
      licenseNumber: 'MD-11223-TX',
      appointmentDuration: 60,
      slots: [1, 2, 3, 4].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '16:30' })),
    },
    {
      email: 'sarah.connor@clinic.com',
      name: 'Sarah Connor',
      specialty: 'Trauma Surgery',
      bio: 'Ready for anything. Expert in emergency and trauma surgical interventions.',
      city: 'Ottawa',
      province: 'ON',
      licenseNumber: 'MD-44556-CA',
      appointmentDuration: 45,
      slots: [1, 3, 5, 0].map((d) => ({ dayOfWeek: d, startTime: '07:00', endTime: '15:00' })),
    },
    {
      email: 'emily.blunt@clinic.com',
      name: 'Emily Blunt',
      specialty: 'Otolaryngology',
      bio: 'Specialist in ear, nose, and throat disorders for both adults and children.',
      city: 'Vancouver',
      province: 'BC',
      licenseNumber: 'MD-77889-UK',
      appointmentDuration: 25,
      slots: [2, 4, 6].map((d) => ({ dayOfWeek: d, startTime: '10:00', endTime: '16:00' })),
    },
    {
      email: 'chris.nolan@clinic.com',
      name: 'Christopher Nolan',
      specialty: 'Sleep Medicine',
      bio: 'Expert in sleep disorders and dreaming mechanics.',
      city: 'Toronto',
      province: 'ON',
      licenseNumber: 'MD-99001-NJ',
      appointmentDuration: 90,
      slots: [1, 4].map((d) => ({ dayOfWeek: d, startTime: '20:00', endTime: '04:00' })),
    },
    {
      email: 'sylvain.cote@clinic.com',
      name: 'Sylvain Côté',
      specialty: 'Oncology',
      bio: 'Oncologue dédié fournissant des soins complets pour divers types de cancer.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-12345-QC',
      appointmentDuration: 45,
      slots: [1, 2, 3, 4].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '16:00' })),
    },
    {
      email: 'nathalie.bergeron@clinic.com',
      name: 'Nathalie Bergeron',
      specialty: 'Dermatology',
      bio: 'Spécialiste de la santé de la peau et des procédures cosmétiques.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-23456-QC',
      appointmentDuration: 20,
      slots: [2, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '16:30' })),
    },
    {
      email: 'marc-andre.roy@clinic.com',
      name: 'Marc-André Roy',
      specialty: 'Pediatrics',
      bio: 'Soins pédiatriques compatissants pour les nourrissons, les enfants et les adolescents.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-34567-QC',
      appointmentDuration: 30,
      slots: [1, 3, 5].map((d) => ({ dayOfWeek: d, startTime: '08:30', endTime: '15:30' })),
    },
    {
      email: 'sylvie.lefebvre@clinic.com',
      name: 'Sylvie Lefebvre',
      specialty: 'Psychiatry',
      bio: 'Expertise dans le traitement de divers troubles de santé mentale.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-45678-QC',
      appointmentDuration: 50,
      slots: [2, 3, 4].map((d) => ({ dayOfWeek: d, startTime: '10:00', endTime: '18:00' })),
    },
    {
      email: 'alain.desjardins@clinic.com',
      name: 'Alain Desjardins',
      specialty: 'Cardiology',
      bio: 'Spécialiste cardiovasculaire axé sur la santé cardiaque et la prévention.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-56789-QC',
      appointmentDuration: 40,
      slots: [1, 4].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00' })),
    },
    {
      email: 'robert.downey@clinic.com',
      name: 'Robert Downey Jr.',
      specialty: 'Thoracic Surgery',
      bio: 'Innovation-driven surgeon specializing in complex chest and heart procedures.',
      city: 'Toronto',
      province: 'ON',
      licenseNumber: 'MD-00001-NY',
      appointmentDuration: 60,
      slots: [1, 3, 5].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '14:00' })),
    },
    {
      email: 'scarlett.j@clinic.com',
      name: 'Scarlett Johansson',
      specialty: 'Plastic Surgery',
      bio: 'Board-certified plastic surgeon with a focus on reconstructive and cosmetic surgery.',
      city: 'Vancouver',
      province: 'BC',
      licenseNumber: 'MD-00002-NY',
      appointmentDuration: 45,
      slots: [2, 4].map((d) => ({ dayOfWeek: d, startTime: '10:00', endTime: '18:00' })),
    },
    {
      email: 'genevieve.levesque@clinic.com',
      name: 'Geneviève Lévesque',
      specialty: 'Neurology',
      bio: 'Neurologue spécialisée dans les troubles du sommeil et l épilepsie.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-67890-QC',
      appointmentDuration: 40,
      slots: [1, 3].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '16:00' })),
    },
    {
      email: 'etienne.moreau@clinic.com',
      name: 'Étienne Moreau',
      specialty: 'Orthopedics',
      bio: 'Chirurgien orthopédiste spécialisé dans les blessures sportives.',
      city: 'Ottawa',
      province: 'ON',
      licenseNumber: 'MD-78901-QC',
      appointmentDuration: 45,
      slots: [2, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '15:00' })),
    },
    {
      email: 'manon.ducharme@clinic.com',
      name: 'Manon Ducharme',
      specialty: 'Ophthalmology',
      bio: 'Expert en chirurgie de la cataracte et soins oculaires généraux.',
      city: 'Montreal',
      province: 'QC',
      licenseNumber: 'MD-89012-QC',
      appointmentDuration: 30,
      slots: [1, 2, 4].map((d) => ({ dayOfWeek: d, startTime: '09:30', endTime: '16:30' })),
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
      update: { city: seed.city, province: seed.province },
      create: {
        userId: user.id,
        specialty: seed.specialty,
        bio: seed.bio,
        city: seed.city,
        province: seed.province,
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
    {
      email: 'robert.brown@email.com',
      name: 'Robert Brown',
      dateOfBirth: new Date('1978-05-15'),
      phone: '+1-555-111-2222',
      medicalNotes: 'Chronic back pain. Previous physical therapy completed. No current medications.',
    },
    {
      email: 'maria.garcia@email.com',
      name: 'Maria Garcia',
      dateOfBirth: new Date('1995-12-10'),
      phone: '+1-555-333-4444',
      medicalNotes: 'Routine screening. Active lifestyle. No medical issues.',
    },
    {
      email: 'william.davis@email.com',
      name: 'William Davis',
      dateOfBirth: new Date('1962-08-04'),
      phone: '+1-555-555-6666',
      medicalNotes: 'Arthritic knees. Takes ibuprofen as needed for pain.',
    },
    {
      email: 'linda.taylor@email.com',
      name: 'Linda Taylor',
      dateOfBirth: new Date('1982-01-25'),
      phone: '+1-555-777-8888',
      medicalNotes: 'Migraine sufferer. Triggers include stress and bright lights.',
    },
    {
      email: 'michael.moore@email.com',
      name: 'Michael Moore',
      dateOfBirth: new Date('2005-09-14'),
      phone: '+1-555-999-0000',
      medicalNotes: 'Student athlete. Monitored for previous ACL tear recovery.',
    },
    {
      email: 'pl.bouchard@email.com',
      name: 'Pierre-Luc Bouchard',
      dateOfBirth: new Date('1988-04-12'),
      phone: '+1-514-555-0101',
      medicalNotes: 'Sensible aux allergies saisonnières. Suivi pour asthme léger.',
    },
    {
      email: 'catherine.pelletier@email.com',
      name: 'Catherine Pelletier',
      dateOfBirth: new Date('1992-07-25'),
      phone: '+1-418-555-0202',
      medicalNotes: 'En bonne santé générale. Consultations de routine uniquement.',
    },
    {
      email: 'mathieu.giroux@email.com',
      name: 'Mathieu Giroux',
      dateOfBirth: new Date('1981-11-30'),
      phone: '+1-450-555-0303',
      medicalNotes: 'Douleurs lombaires chroniques dues au travail de bureau.',
    },
    {
      email: 'chantal.roy@email.com',
      name: 'Chantal Roy',
      dateOfBirth: new Date('1965-02-14'),
      phone: '+1-819-555-0404',
      medicalNotes: 'Hypothyroïdie sous traitement (Synthroid 75mcg).',
    },
    {
      email: 'francois.hebert@email.com',
      name: 'François Hébert',
      dateOfBirth: new Date('1974-06-08'),
      phone: '+1-438-555-0505',
      medicalNotes: 'Ancien fumeur. Bilan de santé cardiovasculaire annuel.',
    },
    {
      email: 'john.wick@email.com',
      name: 'John Wick',
      dateOfBirth: new Date('1964-09-02'),
      phone: '+1-212-555-0001',
      medicalNotes: 'Frequent injuries. High pain tolerance. Requires titanium-grade stitching.',
    },
    {
      email: 'bruce.wayne@email.com',
      name: 'Bruce Wayne',
      dateOfBirth: new Date('1972-02-19'),
      phone: '+1-535-555-0002',
      medicalNotes: 'Numerous scars and healed fractures. Insomnia. High stress levels.',
    },
    {
      email: 'tony.stark@email.com',
      name: 'Tony Stark',
      dateOfBirth: new Date('1970-05-29'),
      phone: '+1-310-555-0003',
      medicalNotes: 'Previous cardiac trauma. Requires periodic shrapnel checks.',
    },
    {
      email: 'natasha.romanoff@email.com',
      name: 'Natasha Romanoff',
      dateOfBirth: new Date('1984-11-22'),
      phone: '+1-202-555-0004',
      medicalNotes: 'Peak physical condition. No remarkable chronic issues.',
    },
    {
      email: 'steve.rogers@email.com',
      name: 'Steve Rogers',
      dateOfBirth: new Date('1918-07-04'),
      phone: '+1-718-555-0005',
      medicalNotes: 'Remarkable metabolic rate. Extremely high vitality for chronologic age.',
    },
    {
      email: 'denis.tremblay@email.com',
      name: 'Denis Tremblay',
      dateOfBirth: new Date('1970-05-15'),
      phone: '+1-514-555-0606',
      medicalNotes: 'Fumeur occasionnel. Suivi pour pression artérielle.',
    },
    {
      email: 'nathalie.gagnon@email.com',
      name: 'Nathalie Gagnon',
      dateOfBirth: new Date('1985-08-22'),
      phone: '+1-418-555-0707',
      medicalNotes: 'Antécédents de diabète de type 2 dans la famille.',
    },
    {
      email: 'mario.lavoie@email.com',
      name: 'Mario Lavoie',
      dateOfBirth: new Date('1962-11-30'),
      phone: '+1-450-555-0808',
      medicalNotes: 'Suivi post-opératoire pour chirurgie de la hanche.',
    },
    {
      email: 'suzanne.cote@email.com',
      name: 'Suzanne Côté',
      dateOfBirth: new Date('1958-03-14'),
      phone: '+1-819-555-0909',
      medicalNotes: 'Ostéoporose. Prend des suppléments de calcium.',
    },
    {
      email: 'richard.morin@email.com',
      name: 'Richard Morin',
      dateOfBirth: new Date('1976-06-08'),
      phone: '+1-438-555-1010',
      medicalNotes: 'Allergie sévère aux arachides (EpiPen requis).',
    },
    {
      email: 'pepper.potts@email.com',
      name: 'Pepper Potts',
      dateOfBirth: new Date('1974-05-12'),
      phone: '+1-212-555-0010',
      medicalNotes: 'Highly organized. Requires periodic stress management. Overall excellent health.',
    },
    {
      email: 'nick.fury@email.com',
      name: 'Nick Fury',
      dateOfBirth: new Date('1950-12-21'),
      phone: '+1-202-555-0011',
      medicalNotes: 'Single eye monitoring. Previous combat-related trauma. High endurance.',
    },
    {
      email: 'lucette.charbonneau@email.com',
      name: 'Lucette Charbonneau',
      dateOfBirth: new Date('1942-09-30'),
      phone: '+1-514-555-2020',
      medicalNotes: 'Diabète de type 2. Suivi régulier pour la glycémie.',
    },
    {
      email: 'gaetan.plouffe@email.com',
      name: 'Gaétan Plouffe',
      dateOfBirth: new Date('1968-11-20'),
      phone: '+1-418-555-3030',
      medicalNotes: 'Asthme chronique. Utilise un inhalateur au besoin.',
    },
    {
      email: 'yvon.rivard@email.com',
      name: 'Yvon Rivard',
      dateOfBirth: new Date('1955-07-15'),
      phone: '+1-450-555-4040',
      medicalNotes: 'Hypertension artérielle. Sous médication (Amlodipine 5mg).',
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
  const [sarah, mike, priya, david, elena, marcus, sophie, kenji, jp, marieeve, luc, isabelle, guy, thomas, sconnor, eblunt, cnolan, sylvain, nathalieB, marcA, sylvieL, alainD, rdj, scarlett, genevieve, etienne, manon] = providers;

  const appointmentData = [
    // ── Original Set (13) ──────────────────────────────────────────
    {
      providerId: sarah.userId,
      patientId: patientIds[0],
      startTime: withHour(daysFromNow(-14), 10),
      endTime:   withHour(daysFromNow(-14), 10, 30),
      status: AppointmentStatus.COMPLETED,
      notes: 'Annual physical. Blood pressure slightly elevated — monitor and recheck in 3 months.',
    },
    {
      providerId: mike.userId,
      patientId: patientIds[1],
      startTime: withHour(daysFromNow(-10), 8),
      endTime:   withHour(daysFromNow(-10), 8, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Cardiology follow-up. ECG normal. Recommended continued diet and exercise plan.',
    },
    {
      providerId: priya.userId,
      patientId: patientIds[2],
      startTime: withHour(daysFromNow(-7), 9),
      endTime:   withHour(daysFromNow(-7), 9, 20),
      status: AppointmentStatus.COMPLETED,
      notes: '6-year wellness visit. All vaccinations up to date. Growth on track.',
    },
    {
      providerId: david.userId,
      patientId: patientIds[3],
      startTime: withHour(daysFromNow(-5), 11),
      endTime:   withHour(daysFromNow(-5), 11, 20),
      status: AppointmentStatus.COMPLETED,
      notes: 'Skin check. One mole removed for biopsy.',
    },
    {
      providerId: elena.userId,
      patientId: patientIds[6],
      startTime: withHour(daysFromNow(-2), 14),
      endTime:   withHour(daysFromNow(-2), 14, 40),
      status: AppointmentStatus.COMPLETED,
      notes: 'Initial neurology consult for migraines.',
    },
    {
      providerId: sarah.userId,
      patientId: patientIds[1],
      startTime: withHour(daysFromNow(-3), 14),
      endTime:   withHour(daysFromNow(-3), 14, 30),
      status: AppointmentStatus.CANCELLED,
      notes: 'Routine checkup.',
      cancellationReason: 'Patient had a work conflict — rescheduled for next week.',
    },
    {
      providerId: marcus.userId,
      patientId: patientIds[5],
      startTime: withHour(daysFromNow(-1), 9),
      endTime:   withHour(daysFromNow(-1), 9, 45),
      status: AppointmentStatus.CANCELLED,
      notes: 'Pre-op consultation.',
      cancellationReason: 'Provider emergency.',
    },
    {
      providerId: sarah.userId,
      patientId: patientIds[0],
      startTime: withHour(daysFromNow(3), 10),
      endTime:   withHour(daysFromNow(3), 10, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Follow-up blood pressure check.',
    },
    {
      providerId: sarah.userId,
      patientId: patientIds[1],
      startTime: withHour(daysFromNow(3), 11),
      endTime:   withHour(daysFromNow(3), 11, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Diabetes management review.',
    },
    {
      providerId: mike.userId,
      patientId: patientIds[4],
      startTime: withHour(daysFromNow(5), 9),
      endTime:   withHour(daysFromNow(5), 9, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Routine heart screening.',
    },
    {
      providerId: david.userId,
      patientId: patientIds[7],
      startTime: withHour(daysFromNow(4), 15),
      endTime:   withHour(daysFromNow(4), 15, 20),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Acne follow-up.',
    },
    {
      providerId: sophie.userId,
      patientId: patientIds[6],
      startTime: withHour(daysFromNow(6), 11),
      endTime:   withHour(daysFromNow(6), 11, 50),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Stress management session.',
    },
    {
      providerId: kenji.userId,
      patientId: patientIds[3],
      startTime: withHour(daysFromNow(8), 10),
      endTime:   withHour(daysFromNow(8), 10, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Vision check for new prescription.',
    },

    // ── Additional Past Appointments (20) ──────────────────────────
    {
      providerId: jp.userId,
      patientId: patientIds[8], // Pierre-Luc
      startTime: withHour(daysFromNow(-20), 14),
      endTime:   withHour(daysFromNow(-20), 14, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Examen de routine. Patient en excellente santé.',
    },
    {
      providerId: marieeve.userId,
      patientId: patientIds[9], // Catherine
      startTime: withHour(daysFromNow(-18), 10),
      endTime:   withHour(daysFromNow(-18), 10, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Consultation annuelle de routine.',
    },
    {
      providerId: luc.userId,
      patientId: patientIds[10], // Mathieu
      startTime: withHour(daysFromNow(-15), 11),
      endTime:   withHour(daysFromNow(-15), 11, 40),
      status: AppointmentStatus.COMPLETED,
      notes: 'Suivi pour reflux gastrique. Ajustement de la médication.',
    },
    {
      providerId: isabelle.userId,
      patientId: patientIds[11], // Chantal
      startTime: withHour(daysFromNow(-12), 9),
      endTime:   withHour(daysFromNow(-12), 9, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Vérification de la thyroïde. Taux stables.',
    },
    {
      providerId: guy.userId,
      patientId: patientIds[12], // François
      startTime: withHour(daysFromNow(-10), 13),
      endTime:   withHour(daysFromNow(-10), 13, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Bilan urologique complet.',
    },
    {
      providerId: sylvain.userId,
      patientId: patientIds[13], // John Wick
      startTime: withHour(daysFromNow(-5), 8),
      endTime:   withHour(daysFromNow(-5), 8, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Post-trauma oncology screening. No abnormalities found.',
    },
    {
      providerId: marcA.userId,
      patientId: patientIds[14], // Bruce Wayne
      startTime: withHour(daysFromNow(-25), 14),
      endTime:   withHour(daysFromNow(-25), 14, 30),
      status: AppointmentStatus.COMPLETED,
      notes: 'Consultation for billionaire orphan issues (Wait, this is pediatrics). Physical exam complete.',
    },
    {
      providerId: rdj.userId,
      patientId: patientIds[15], // Tony Stark
      startTime: withHour(daysFromNow(-30), 10),
      endTime:   withHour(daysFromNow(-30), 11),
      status: AppointmentStatus.COMPLETED,
      notes: 'Chest reactor housing integration check. Tissue healing progressing well.',
    },
    {
      providerId: scarlett.userId,
      patientId: patientIds[16], // Natasha
      startTime: withHour(daysFromNow(-1), 16),
      endTime:   withHour(daysFromNow(-1), 16, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Scar revision consultation following covert operation.',
    },
    {
      providerId: genevieve.userId,
      patientId: patientIds[17], // Steve Rogers
      startTime: withHour(daysFromNow(-40), 9),
      endTime:   withHour(daysFromNow(-40), 10),
      status: AppointmentStatus.COMPLETED,
      notes: 'Post-thaw neurological assessment. Remarkable cognitive recovery.',
    },
    {
      providerId: etienne.userId,
      patientId: patientIds[18], // Denis Tremblay
      startTime: withHour(daysFromNow(-5), 13),
      endTime:   withHour(daysFromNow(-5), 13, 45),
      status: AppointmentStatus.COMPLETED,
      notes: 'Physiothérapie pour blessure au genou.',
    },
    {
      providerId: manon.userId,
      patientId: patientIds[19], // Nathalie Gagnon
      startTime: withHour(daysFromNow(-8), 10),
      endTime:   withHour(daysFromNow(-8), 10, 30),
      status: AppointmentStatus.COMPLETED,
      notes: 'Examen de la vue. Prescription stable.',
    },
    {
      providerId: alainD.userId,
      patientId: patientIds[20], // Mario Lavoie
      startTime: withHour(daysFromNow(-12), 14),
      endTime:   withHour(daysFromNow(-12), 14, 40),
      status: AppointmentStatus.COMPLETED,
      notes: 'Test d effort cardiaque. Résultats satisfaisants.',
    },
    {
      providerId: sylvieL.userId,
      patientId: patientIds[21], // Suzanne Côté
      startTime: withHour(daysFromNow(-4), 15),
      endTime:   withHour(daysFromNow(-4), 16),
      status: AppointmentStatus.COMPLETED,
      notes: 'Session de thérapie de soutien.',
    },
    {
      providerId: nathalieB.userId,
      patientId: patientIds[22], // Richard Morin
      startTime: withHour(daysFromNow(-7), 11),
      endTime:   withHour(daysFromNow(-7), 11, 20),
      status: AppointmentStatus.COMPLETED,
      notes: 'Traitement pour eczéma sévère.',
    },
    {
      providerId: thomas.userId,
      patientId: patientIds[23], // Pepper Potts
      startTime: withHour(daysFromNow(-3), 9),
      endTime:   withHour(daysFromNow(-3), 10),
      status: AppointmentStatus.COMPLETED,
      notes: 'Executive health screening. High stress but healthy.',
    },
    {
      providerId: cnolan.userId,
      patientId: patientIds[24], // Nick Fury
      startTime: withHour(daysFromNow(-2), 22),
      endTime:   withHour(daysFromNow(-2), 23),
      status: AppointmentStatus.COMPLETED,
      notes: 'Late night sleep study assessment.',
    },
    {
      providerId: eblunt.userId,
      patientId: patientIds[25], // Lucette
      startTime: withHour(daysFromNow(-10), 10),
      endTime:   withHour(daysFromNow(-10), 10, 30),
      status: AppointmentStatus.COMPLETED,
      notes: 'Ear cleaning and hearing test.',
    },
    {
      providerId: sconnor.userId,
      patientId: patientIds[26], // Gaétan
      startTime: withHour(daysFromNow(-1), 11),
      endTime:   withHour(daysFromNow(-1), 12),
      status: AppointmentStatus.COMPLETED,
      notes: 'Trauma recovery checkup.',
    },
    {
      providerId: genevieve.userId,
      patientId: patientIds[27], // Yvon
      startTime: withHour(daysFromNow(-6), 14),
      endTime:   withHour(daysFromNow(-6), 15),
      status: AppointmentStatus.COMPLETED,
      notes: 'Évaluation neurologique générale.',
    },

    // ── Additional Upcoming Appointments (30) ──────────────────────
    {
      providerId: jp.userId,
      patientId: patientIds[0],
      startTime: withHour(daysFromNow(2), 10),
      endTime:   withHour(daysFromNow(2), 10, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Suivi de routine.',
    },
    {
      providerId: marieeve.userId,
      patientId: patientIds[1],
      startTime: withHour(daysFromNow(4), 14),
      endTime:   withHour(daysFromNow(4), 14, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Consultation spécialisée.',
    },
    {
      providerId: luc.userId,
      patientId: patientIds[2],
      startTime: withHour(daysFromNow(6), 11),
      endTime:   withHour(daysFromNow(6), 11, 40),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Test de tolérance alimentaire.',
    },
    {
      providerId: isabelle.userId,
      patientId: patientIds[3],
      startTime: withHour(daysFromNow(8), 9),
      endTime:   withHour(daysFromNow(8), 9, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Bilan hormonal.',
    },
    {
      providerId: guy.userId,
      patientId: patientIds[4],
      startTime: withHour(daysFromNow(10), 13),
      endTime:   withHour(daysFromNow(10), 13, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Contrôle post-opératoire.',
    },
    {
      providerId: thomas.userId,
      patientId: patientIds[5],
      startTime: withHour(daysFromNow(12), 10),
      endTime:   withHour(daysFromNow(12), 11),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Review of labs.',
    },
    {
      providerId: sconnor.userId,
      patientId: patientIds[6],
      startTime: withHour(daysFromNow(1), 14),
      endTime:   withHour(daysFromNow(1), 14, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Emergency preparedness workshop.',
    },
    {
      providerId: eblunt.userId,
      patientId: patientIds[7],
      startTime: withHour(daysFromNow(3), 11),
      endTime:   withHour(daysFromNow(3), 11, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Sinus consultation.',
    },
    {
      providerId: cnolan.userId,
      patientId: patientIds[8],
      startTime: withHour(daysFromNow(5), 23),
      endTime:   withHour(daysFromNow(5), 0, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Dream architecture session.',
    },
    {
      providerId: rdj.userId,
      patientId: patientIds[14], // Bruce Wayne
      startTime: withHour(daysFromNow(7), 10),
      endTime:   withHour(daysFromNow(7), 11),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Billionaire health summit follow-up.',
    },
    {
      providerId: sylvain.userId,
      patientId: patientIds[9],
      startTime: withHour(daysFromNow(9), 11),
      endTime:   withHour(daysFromNow(9), 11, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Nouveau patient oncology.',
    },
    {
      providerId: nathalieB.userId,
      patientId: patientIds[10],
      startTime: withHour(daysFromNow(11), 13),
      endTime:   withHour(daysFromNow(11), 13, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Traitement laser.',
    },
    {
      providerId: marcA.userId,
      patientId: patientIds[11],
      startTime: withHour(daysFromNow(1), 10),
      endTime:   withHour(daysFromNow(1), 10, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Vaccination annuelle.',
    },
    {
      providerId: sylvieL.userId,
      patientId: patientIds[12],
      startTime: withHour(daysFromNow(3), 15),
      endTime:   withHour(daysFromNow(3), 16),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Cognitive behavioral therapy.',
    },
    {
      providerId: alainD.userId,
      patientId: patientIds[13],
      startTime: withHour(daysFromNow(5), 14),
      endTime:   withHour(daysFromNow(5), 14, 40),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Heart rate monitoring results.',
    },
    {
      providerId: scarlett.userId,
      patientId: patientIds[15],
      startTime: withHour(daysFromNow(14), 11),
      endTime:   withHour(daysFromNow(14), 12),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Consultation for elective procedure.',
    },
    {
      providerId: genevieve.userId,
      patientId: patientIds[16],
      startTime: withHour(daysFromNow(2), 15),
      endTime:   withHour(daysFromNow(2), 16),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Neurological follow-up.',
    },
    {
      providerId: etienne.userId,
      patientId: patientIds[17],
      startTime: withHour(daysFromNow(4), 13),
      endTime:   withHour(daysFromNow(4), 13, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Sports injury assessment.',
    },
    {
      providerId: manon.userId,
      patientId: patientIds[18],
      startTime: withHour(daysFromNow(6), 14),
      endTime:   withHour(daysFromNow(6), 14, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Cataract surgery screening.',
    },
    {
      providerId: sarah.userId,
      patientId: patientIds[27], // Yvon
      startTime: withHour(daysFromNow(10), 11),
      endTime:   withHour(daysFromNow(10), 11, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Hypertension monitoring.',
    },
    {
      providerId: mike.userId,
      patientId: patientIds[26], // Gaétan
      startTime: withHour(daysFromNow(12), 11),
      endTime:   withHour(daysFromNow(12), 11, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Cardiac echo prep.',
    },
    {
      providerId: priya.userId,
      patientId: patientIds[25], // Lucette
      startTime: withHour(daysFromNow(1), 16),
      endTime:   withHour(daysFromNow(1), 16, 20),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Wellness checkup for grandchild (Wait, Lucette is the patient). Pediatric consult.',
    },
    {
      providerId: david.userId,
      patientId: patientIds[24], // Nick Fury
      startTime: withHour(daysFromNow(3), 10),
      endTime:   withHour(daysFromNow(3), 10, 20),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Follow-up on tactical skin graft.',
    },
    {
      providerId: elena.userId,
      patientId: patientIds[23], // Pepper Potts
      startTime: withHour(daysFromNow(5), 15),
      endTime:   withHour(daysFromNow(5), 15, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Stress-induced headache consult.',
    },
    {
      providerId: marcus.userId,
      patientId: patientIds[22], // Richard
      startTime: withHour(daysFromNow(7), 13),
      endTime:   withHour(daysFromNow(7), 13, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Joint pain discussion.',
    },
    {
      providerId: sophie.userId,
      patientId: patientIds[21], // Suzanne
      startTime: withHour(daysFromNow(9), 11),
      endTime:   withHour(daysFromNow(9), 12),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Weekly therapy.',
    },
    {
      providerId: kenji.userId,
      patientId: patientIds[20], // Mario
      startTime: withHour(daysFromNow(11), 10),
      endTime:   withHour(daysFromNow(11), 10, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Post-op vision check.',
    },
    {
      providerId: jp.userId,
      patientId: patientIds[19], // Nathalie G
      startTime: withHour(daysFromNow(2), 14),
      endTime:   withHour(daysFromNow(2), 14, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Examen annuel.',
    },
    {
      providerId: marieeve.userId,
      patientId: patientIds[18], // Denis
      startTime: withHour(daysFromNow(4), 10),
      endTime:   withHour(daysFromNow(4), 10, 45),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Consultation gyneco.',
    },
    {
      providerId: luc.userId,
      patientId: patientIds[17], // Steve
      startTime: withHour(daysFromNow(6), 14),
      endTime:   withHour(daysFromNow(6), 14, 40),
      status: AppointmentStatus.SCHEDULED,
      notes: 'Digestive health review.',
    },

    // ── Additional Cancelled Appointments (10) ─────────────────────
    {
      providerId: jp.userId,
      patientId: patientIds[5],
      startTime: withHour(daysFromNow(-5), 15),
      endTime:   withHour(daysFromNow(-5), 15, 45),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Scheduled by mistake.',
    },
    {
      providerId: rdj.userId,
      patientId: patientIds[13], // John Wick
      startTime: withHour(daysFromNow(-2), 13),
      endTime:   withHour(daysFromNow(-2), 14),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Patient unavailable due to "business trip" in Rome.',
    },
    {
      providerId: scarlett.userId,
      patientId: patientIds[14], // Bruce Wayne
      startTime: withHour(daysFromNow(1), 22),
      endTime:   withHour(daysFromNow(1), 23),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Patient is busy at night.',
    },
    {
      providerId: sylvain.userId,
      patientId: patientIds[12],
      startTime: withHour(daysFromNow(3), 11),
      endTime:   withHour(daysFromNow(3), 11, 45),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Conflict with work.',
    },
    {
      providerId: nathalieB.userId,
      patientId: patientIds[11],
      startTime: withHour(daysFromNow(5), 14),
      endTime:   withHour(daysFromNow(5), 14, 30),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Illness.',
    },
    {
      providerId: marcA.userId,
      patientId: patientIds[10],
      startTime: withHour(daysFromNow(7), 10),
      endTime:   withHour(daysFromNow(7), 10, 30),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Vacation.',
    },
    {
      providerId: sylvieL.userId,
      patientId: patientIds[9],
      startTime: withHour(daysFromNow(9), 16),
      endTime:   withHour(daysFromNow(9), 17),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'No show.',
    },
    {
      providerId: alainD.userId,
      patientId: patientIds[8],
      startTime: withHour(daysFromNow(1), 14),
      endTime:   withHour(daysFromNow(1), 14, 40),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Weather conditions.',
    },
    {
      providerId: isabelle.userId,
      patientId: patientIds[7],
      startTime: withHour(daysFromNow(3), 9),
      endTime:   withHour(daysFromNow(3), 9, 45),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Personal reasons.',
    },
    {
      providerId: guy.userId,
      patientId: patientIds[6],
      startTime: withHour(daysFromNow(5), 13),
      endTime:   withHour(daysFromNow(5), 13, 45),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Moved out of area.',
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
  console.log('  sarah.johnson@clinic.com   — Family Medicine');
  console.log('  mike.chen@clinic.com       — Cardiology');
  console.log('  priya.patel@clinic.com     — Pediatrics');
  console.log('  david.miller@clinic.com    — Dermatology');
  console.log('  elena.rodriguez@clinic.com — Neurology');
  console.log('  marcus.thorne@clinic.com   — Orthopedics');
  console.log('  sophie.dubois@clinic.com   — Psychiatry');
  console.log('  kenji.sato@clinic.com      — Ophthalmology');
  console.log('PATIENTS');
  console.log('  alice.smith@email.com      — Alice Smith');
  console.log('  james.nguyen@email.com     — James Nguyen');
  console.log('  emma.wilson@email.com      — Emma Wilson');
  console.log('  robert.brown@email.com     — Robert Brown');
  console.log('  maria.garcia@email.com     — Maria Garcia');
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
