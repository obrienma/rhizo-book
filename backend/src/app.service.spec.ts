import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return the running message', () => {
      expect(service.getHello()).toBe('💊 Health Scheduler API is running');
    });

    it('should return a string', () => {
      expect(typeof service.getHello()).toBe('string');
    });
  });
});
