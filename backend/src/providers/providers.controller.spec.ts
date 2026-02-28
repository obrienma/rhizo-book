import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

describe('ProvidersController', () => {
  let controller: ProvidersController;
  let service: { findAll: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [{ provide: ProvidersService, useValue: service }],
    }).compile();

    controller = module.get<ProvidersController>(ProvidersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all providers', async () => {
      const providers = [{ id: 1, name: 'Dr. A' }];
      service.findAll.mockResolvedValue(providers);

      const result = await controller.findAll();

      expect(result).toEqual(providers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with parsed integer id', async () => {
      service.findOne.mockResolvedValue({ id: 7, name: 'Dr. Bob' });

      const result = await controller.findOne('7');

      expect(service.findOne).toHaveBeenCalledWith(7);
      expect(result).toEqual({ id: 7, name: 'Dr. Bob' });
    });
  });
});
