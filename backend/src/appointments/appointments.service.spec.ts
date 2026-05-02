import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../test-utils/prisma.mock';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      providerId: 7,
      startTime: '2026-03-15T09:00:00.000Z',
      endTime: '2026-03-15T09:30:00.000Z',
      notes: 'Checkup',
    };

    it('should throw ConflictException when time slot is taken', async () => {
      prisma.appointment.findFirst.mockResolvedValue({ id: 99 });

      await expect(service.create(dto, 12)).rejects.toThrow(ConflictException);
    });

    it('should create an appointment when slot is free', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      const created = {
        id: 1,
        ...dto,
        patientId: 12,
        status: 'SCHEDULED',
        provider: { id: 7, name: 'Dr. Bob', email: 'bob@test.com' },
        patient: { id: 12, name: 'Alice', email: 'alice@test.com' },
      };
      prisma.appointment.create.mockResolvedValue(created);

      const result = await service.create(dto, 12);

      expect(prisma.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            providerId: 7,
            patientId: 12,
            notes: 'Checkup',
            status: 'SCHEDULED',
          }),
        }),
      );
      expect(result).toEqual(created);
    });

    it('should convert startTime and endTime to Date objects', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue({ id: 1 });

      await service.create(dto, 12);

      const createCall = prisma.appointment.create.mock.calls[0][0];
      expect(createCall.data.startTime).toBeInstanceOf(Date);
      expect(createCall.data.endTime).toBeInstanceOf(Date);
    });

    it('should create without notes when not provided', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue({ id: 1 });

      const { notes, ...dtoNoNotes } = dto;
      await service.create(dtoNoNotes as any, 12);

      const createCall = prisma.appointment.create.mock.calls[0][0];
      expect(createCall.data.notes).toBeUndefined();
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should filter by providerId for provider role', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await service.findAll(7, 'provider');

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { providerId: 7 },
        }),
      );
    });

    it('should filter by patientId for patient role', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await service.findAll(12, 'patient');

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { patientId: 12 },
        }),
      );
    });

    it('should order by startTime ascending', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await service.findAll(1, 'patient');

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { startTime: 'asc' },
        }),
      );
    });

    it('should return appointments list', async () => {
      const appointments = [{ id: 1 }, { id: 2 }];
      prisma.appointment.findMany.mockResolvedValue(appointments);

      const result = await service.findAll(7, 'provider');

      expect(result).toEqual(appointments);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should throw NotFoundException when appointment does not exist', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1, 'patient')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not provider or patient of appointment', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        id: 1,
        providerId: 7,
        patientId: 12,
      });

      await expect(service.findOne(1, 99, 'patient')).rejects.toThrow(ForbiddenException);
    });

    it('should return the appointment when user is the provider', async () => {
      const appt = { id: 1, providerId: 7, patientId: 12, status: 'SCHEDULED' };
      prisma.appointment.findUnique.mockResolvedValue(appt);

      const result = await service.findOne(1, 7, 'provider');

      expect(result).toEqual(appt);
    });

    it('should return the appointment when user is the patient', async () => {
      const appt = { id: 1, providerId: 7, patientId: 12, status: 'SCHEDULED' };
      prisma.appointment.findUnique.mockResolvedValue(appt);

      const result = await service.findOne(1, 12, 'patient');

      expect(result).toEqual(appt);
    });
  });

  // ─── cancel ────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('should throw ConflictException when appointment is not SCHEDULED', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        id: 1,
        providerId: 7,
        patientId: 12,
        status: 'CANCELLED',
      });

      await expect(service.cancel(1, 7, 'provider', 'reason')).rejects.toThrow(ConflictException);
    });

    it('should cancel a scheduled appointment', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        id: 1,
        providerId: 7,
        patientId: 12,
        status: 'SCHEDULED',
      });
      prisma.appointment.update.mockResolvedValue({
        id: 1,
        status: 'CANCELLED',
        cancellationReason: 'Too busy',
      });

      const result = await service.cancel(1, 7, 'provider', 'Too busy');

      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { status: 'CANCELLED', cancellationReason: 'Too busy' },
        }),
      );
      expect(result.status).toBe('CANCELLED');
    });

    it('should cancel without a reason', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        id: 1,
        providerId: 7,
        patientId: 12,
        status: 'SCHEDULED',
      });
      prisma.appointment.update.mockResolvedValue({ id: 1, status: 'CANCELLED' });

      await service.cancel(1, 7, 'provider');

      const updateCall = prisma.appointment.update.mock.calls[0][0];
      expect(updateCall.data.cancellationReason).toBeUndefined();
    });

    it('should throw ForbiddenException if user is not related to the appointment', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        id: 1,
        providerId: 7,
        patientId: 12,
        status: 'SCHEDULED',
      });

      await expect(service.cancel(1, 99, 'patient')).rejects.toThrow(ForbiddenException);
    });
  });
});
