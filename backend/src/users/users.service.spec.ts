import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../test-utils/prisma.mock';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user without password when found', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'alice@test.com',
        name: 'Alice',
        password: 'hashed-pw',
        roleId: 2,
        role: { id: 2, name: 'patient' },
        providerProfile: null,
        patientProfile: { id: 1, userId: 1 },
      });

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('alice@test.com');
      expect(result.role.name).toBe('patient');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should include role, providerProfile, and patientProfile', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        password: 'x',
        role: {},
        providerProfile: null,
        patientProfile: null,
      });

      await service.findOne(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { role: true, providerProfile: true, patientProfile: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 1, email: 'a@b.com', name: 'A', password: 'pw1', role: { name: 'provider' } },
        { id: 2, email: 'c@d.com', name: 'B', password: 'pw2', role: { name: 'patient' } },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should return empty array when no users exist', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should include role in the query', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: { role: true },
      });
    });
  });
});
