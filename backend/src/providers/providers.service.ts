import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(specialty?: string, city?: string, province?: string) {
    return this.prisma.user.findMany({
      where: {
        role: { name: 'provider' },
        ...(specialty || city || province
          ? {
              providerProfile: {
                ...(specialty ? { specialty: { contains: specialty, mode: 'insensitive' } } : {}),
                ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
                ...(province ? { province: { contains: province, mode: 'insensitive' } } : {}),
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        providerProfile: {
          select: {
            specialty: true,
            bio: true,
            city: true,
            province: true,
            appointmentDuration: true,
          },
        },
      },
    });
  }

  async findSearchOptions() {
    const [specialties, cities, provinces] = await Promise.all([
      this.prisma.providerProfile.findMany({
        select: { specialty: true },
        distinct: ['specialty'],
        where: { specialty: { not: null } },
        orderBy: { specialty: 'asc' },
      }),
      this.prisma.providerProfile.findMany({
        select: { city: true },
        distinct: ['city'],
        where: { city: { not: null } },
        orderBy: { city: 'asc' },
      }),
      this.prisma.providerProfile.findMany({
        select: { province: true },
        distinct: ['province'],
        where: { province: { not: null } },
        orderBy: { province: 'asc' },
      }),
    ]);
    return {
      specialties: specialties.map((r) => r.specialty as string),
      cities: cities.map((r) => r.city as string),
      provinces: provinces.map((r) => r.province as string),
    };
  }

  async findOne(id: number) {
    const provider = await this.prisma.user.findFirst({
      where: {
        id,
        role: { name: 'provider' },
      },
      select: {
        id: true,
        name: true,
        providerProfile: {
          select: {
            specialty: true,
            bio: true,
            city: true,
            province: true,
            appointmentDuration: true,
            availabilitySlots: {
              where: { isActive: true },
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
              select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }
}
