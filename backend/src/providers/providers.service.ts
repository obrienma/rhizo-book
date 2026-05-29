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
