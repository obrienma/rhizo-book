import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: { name: 'provider' },
      },
      // include: {
      //   providerProfile: {
      //     include: {
      //       availabilitySlots: true,
      //     },
      //   },
      // },
      select: {
        id: true,
        name: true,
        email: true,
        providerProfile: true,
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
        email: true,
        providerProfile: {
          include: {
            availabilitySlots: {
              where: { isActive: true },
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
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
