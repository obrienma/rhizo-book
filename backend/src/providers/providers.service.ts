import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(specialty?: string) {
    return this.prisma.user.findMany({
      where: {
        role: { name: 'provider' },
        ...(specialty
          ? {
              providerProfile: {
                specialty: { contains: specialty, mode: 'insensitive' },
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
