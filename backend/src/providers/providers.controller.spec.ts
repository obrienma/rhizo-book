import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

describe('ProvidersController', () => {
  let controller: ProvidersController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; findSearchOptions: jest.Mock };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findSearchOptions: jest.fn(),
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
    it('should return all providers without any filter', async () => {
      const providers = [{ id: 1, name: 'Dr. A' }];
      service.findAll.mockResolvedValue(providers);

      const result = await controller.findAll(undefined, undefined, undefined);

      expect(result).toEqual(providers);
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    });

    it('should pass specialty filter to service', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll('cardiology', undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith('cardiology', undefined, undefined);
    });

    it('should pass city and province filters to service', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll(undefined, 'toronto', 'ON');

      expect(service.findAll).toHaveBeenCalledWith(undefined, 'toronto', 'ON');
    });
  });

  describe('getSearchOptions', () => {
    it('should return search options from service', async () => {
      const options = { specialties: ['Cardiology'], cities: ['Toronto'], provinces: ['ON'] };
      service.findSearchOptions.mockResolvedValue(options);

      const result = await controller.getSearchOptions();

      expect(service.findSearchOptions).toHaveBeenCalled();
      expect(result).toEqual(options);
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
