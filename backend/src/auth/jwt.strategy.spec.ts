import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: { validateUser: jest.Mock };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    authService = { validateUser: jest.fn() };
    strategy = new JwtStrategy(authService as unknown as AuthService);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user when valid', async () => {
      const mockUser = { id: 1, email: 'a@b.com', role: { name: 'patient' } };
      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: 1, email: 'a@b.com', roleId: 2 });

      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 999, email: 'gone@b.com', roleId: 1 }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('constructor', () => {
    it('should throw Error when JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;

      expect(() => {
        new JwtStrategy(authService as unknown as AuthService);
      }).toThrow('JWT_SECRET environment variable is not set');
    });
  });
});
