import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../test-utils/prisma.mock';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof mockPrismaService>;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = mockPrismaService();
    jwtService = { sign: jest.fn().mockReturnValue('mock-jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── register ──────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      email: 'new@test.com',
      name: 'New User',
      password: 'password123',
      roleId: 1,
    };

    it('should throw ConflictException when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'new@test.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should hash the password before storing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 1,
        ...registerDto,
        password: 'hashed-pw',
        role: { id: 1, name: 'provider' },
      });
      prisma.providerProfile.create.mockResolvedValue({});

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should create a provider profile when role is provider', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 1,
        ...registerDto,
        password: 'hashed-pw',
        role: { id: 1, name: 'provider' },
      });
      prisma.providerProfile.create.mockResolvedValue({});

      await service.register(registerDto);

      expect(prisma.providerProfile.create).toHaveBeenCalledWith({ data: { userId: 1 } });
      expect(prisma.patientProfile.create).not.toHaveBeenCalled();
    });

    it('should create a patient profile when role is patient', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 2,
        ...registerDto,
        roleId: 2,
        password: 'hashed-pw',
        role: { id: 2, name: 'patient' },
      });
      prisma.patientProfile.create.mockResolvedValue({});

      await service.register({ ...registerDto, roleId: 2 });

      expect(prisma.patientProfile.create).toHaveBeenCalledWith({ data: { userId: 2 } });
      expect(prisma.providerProfile.create).not.toHaveBeenCalled();
    });

    it('should return user without password and an access_token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'new@test.com',
        name: 'New User',
        password: 'hashed-pw',
        roleId: 1,
        role: { id: 1, name: 'provider' },
      });
      prisma.providerProfile.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('new@test.com');
    });

    it('should sign a JWT with correct payload', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 5,
        email: 'new@test.com',
        name: 'New User',
        password: 'hashed-pw',
        roleId: 1,
        role: { id: 1, name: 'provider' },
      });
      prisma.providerProfile.create.mockResolvedValue({});

      await service.register(registerDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 5,
        email: 'new@test.com',
        roleId: 1,
      });
    });
  });

  // ─── login ─────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = { email: 'bob@test.com', password: 'password123' };

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'bob@test.com',
        password: 'hashed-pw',
        role: { id: 1, name: 'provider' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return user without password and an access_token on success', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'bob@test.com',
        name: 'Bob',
        password: 'hashed-pw',
        roleId: 1,
        role: { id: 1, name: 'provider' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('bob@test.com');
    });

    it('should compare plain-text password with hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'bob@test.com',
        password: 'hashed-pw',
        role: { id: 1, name: 'provider' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-pw');
    });
  });

  // ─── validateUser ──────────────────────────────────────────────────

  describe('validateUser', () => {
    it('should return the user with role when found', async () => {
      const mockUser = { id: 1, email: 'bob@test.com', role: { name: 'provider' } };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { role: true },
      });
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(999);

      expect(result).toBeNull();
    });
  });
});
