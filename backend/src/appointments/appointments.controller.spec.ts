import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    cancel: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [{ provide: AppointmentsService, useValue: service }],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  const mockReq = (userId: number, roleName: string) => ({
    user: { id: userId, role: { name: roleName } },
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with DTO and authenticated user id', async () => {
      const dto = { providerId: 7, startTime: '2026-03-15T09:00:00Z', endTime: '2026-03-15T09:30:00Z' };
      service.create.mockResolvedValue({ id: 1 });

      const result = await controller.create(dto as any, mockReq(12, 'patient'));

      expect(service.create).toHaveBeenCalledWith(dto, 12);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with user id and role for provider', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq(7, 'provider'));

      expect(service.findAll).toHaveBeenCalledWith(7, 'provider');
    });

    it('should call service.findAll with user id and role for patient', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq(12, 'patient'));

      expect(service.findAll).toHaveBeenCalledWith(12, 'patient');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with parsed id', async () => {
      service.findOne.mockResolvedValue({ id: 1 });

      const result = await controller.findOne('1', mockReq(7, 'provider'));

      expect(service.findOne).toHaveBeenCalledWith(1, 7, 'provider');
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('cancel', () => {
    it('should call service.cancel with id, user info, and reason', async () => {
      service.cancel.mockResolvedValue({ id: 1, status: 'CANCELLED' });
      const cancelDto = { reason: 'Conflict' };

      const result = await controller.cancel('1', mockReq(12, 'patient'), cancelDto as any);

      expect(service.cancel).toHaveBeenCalledWith(1, 12, 'patient', 'Conflict');
      expect(result.status).toBe('CANCELLED');
    });

    it('should handle cancel without reason', async () => {
      service.cancel.mockResolvedValue({ id: 1, status: 'CANCELLED' });
      const cancelDto = {};

      await controller.cancel('1', mockReq(7, 'provider'), cancelDto as any);

      expect(service.cancel).toHaveBeenCalledWith(1, 7, 'provider', undefined);
    });
  });
});
