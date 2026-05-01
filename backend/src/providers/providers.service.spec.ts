import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../test-utils/prisma.mock';

describe('ProvidersService', () => {
  let service: ProvidersService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all providers when no specialty is given', async () => {
      const providers = [
        { id: 1, name: 'Dr. A', email: 'a@test.com', providerProfile: {} },
        { id: 2, name: 'Dr. B', email: 'b@test.com', providerProfile: {} },
      ];
      prisma.user.findMany.mockResolvedValue(providers);

      const result = await service.findAll();

      expect(result).toEqual(providers);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: { name: 'provider' } },
        }),
      );
    });

    it('should filter by specialty when provided', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.findAll('cardiology');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            role: { name: 'provider' },
            providerProfile: {
              specialty: { contains: 'cardiology', mode: 'insensitive' },
            },
          },
        }),
      );
    });

    it('should return empty array when no providers exist', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should select only public fields and omit email and licenseNumber', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
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
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single provider by id', async () => {
      const provider = {
        id: 7,
        name: 'Dr. Bob',
        email: 'bob@test.com',
        providerProfile: {
          specialty: 'Cardiology',
          availabilitySlots: [
            { id: 1, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
          ],
        },
      };
      prisma.user.findFirst.mockResolvedValue(provider);

      const result = await service.findOne(7);

      expect(result).toEqual(provider);
      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 7, role: { name: 'provider' } },
        }),
      );
    });

    it('should throw NotFoundException when provider does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should only include active availability slots', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 7 });

      await service.findOne(7);

      const call = prisma.user.findFirst.mock.calls[0][0];
      expect(call.select.providerProfile.select.availabilitySlots.where).toEqual({
        isActive: true,
      });
    });

    it('should order slots by dayOfWeek then startTime ascending', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 7 });

      await service.findOne(7);

      const call = prisma.user.findFirst.mock.calls[0][0];
      expect(call.select.providerProfile.select.availabilitySlots.orderBy).toEqual([
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ]);
    });

    it('should not expose email or licenseNumber', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 7 });

      await service.findOne(7);

      const { select } = prisma.user.findFirst.mock.calls[0][0];
      expect(select).not.toHaveProperty('email');
      expect(select.providerProfile.select).not.toHaveProperty('licenseNumber');
    });

    it('should select only public fields from providerProfile', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 7 });

      await service.findOne(7);

      const { select } = prisma.user.findFirst.mock.calls[0][0];
      expect(Object.keys(select)).toEqual(['id', 'name', 'providerProfile']);
      expect(Object.keys(select.providerProfile.select)).toEqual([
        'specialty', 'bio', 'appointmentDuration', 'availabilitySlots',
      ]);
    });

    it('should select only public fields from availability slots', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 7 });

      await service.findOne(7);

      const slotSelect =
        prisma.user.findFirst.mock.calls[0][0].select.providerProfile.select.availabilitySlots.select;
      expect(slotSelect).toEqual({
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      });
    });
  });
});
