import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return the running message', () => {
      expect(controller.getHello()).toBe('💊 Health Scheduler API is running');
    });
  });

  describe('healthCheck', () => {
    it('should return an object with status ok', () => {
      const result = controller.healthCheck();
      expect(result).toMatchObject({
        status: 'ok',
        service: 'Health Scheduler API',
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should return a valid ISO timestamp', () => {
      const result = controller.healthCheck();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });
});
