import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
    // Prevent real DB connections during tests
    service.$connect = jest.fn();
    service.$on = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      await service.onModuleInit();
      expect(service.$connect).toHaveBeenCalled();
    });
  });

  describe('enableShutdownHooks', () => {
    it('should register a beforeExit hook', () => {
      const mockApp = { close: jest.fn() };
      service.enableShutdownHooks(mockApp);
      expect(service.$on).toHaveBeenCalledWith('beforeExit', expect.any(Function));
    });
  });
});
