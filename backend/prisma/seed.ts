import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
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

  console.log('✅ Roles created:', { providerRole, patientRole });

  // Create provider user
  const hashedPassword = await bcrypt.hash('password', 10);

  const provider = await prisma.user.upsert({
    where: { email: 'provider@test.com' },
    update: {},
    create: {
      email: 'provider@test.com',
      name: 'Dr. Sarah Johnson',
      password: hashedPassword,
      roleId: providerRole.id,
    },
  });

  console.log('✅ Provider user created:', provider.email);

  // Create provider profile
  await prisma.providerProfile.upsert({
    where: { userId: provider.id },
    update: {},
    create: {
      userId: provider.id,
      specialty: 'Family Medicine',
      bio: 'Experienced family physician with 10+ years of practice.',
      licenseNumber: 'MD-12345',
      appointmentDuration: 30,
    },
  });

  console.log('✅ Provider profile created');

  // Create availability slots for provider (Mon-Fri, 9am-5pm)
  for (let day = 1; day <= 5; day++) {
    await prisma.availabilitySlot.create({
      data: {
        providerId: provider.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    });
  }

  console.log('✅ Availability slots created (Mon-Fri, 9am-5pm)');

  // Create patient user
  const patient = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: {
      email: 'patient@test.com',
      name: 'John Doe',
      password: hashedPassword,
      roleId: patientRole.id,
    },
  });

  console.log('✅ Patient user created:', patient.email);

  // Create patient profile
  await prisma.patientProfile.upsert({
    where: { userId: patient.id },
    update: {},
    create: {
      userId: patient.id,
      dateOfBirth: new Date('1990-05-15'),
      phone: '555-0123',
    },
  });

  console.log('✅ Patient profile created');
  console.log('\n🎉 Seed data created successfully!');
  console.log('\nTest credentials:');
  console.log('Provider: provider@test.com / password');
  console.log('Patient: patient@test.com / password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
