/**
 * Shared mock factory for PrismaService used across all unit tests.
 * Each nested model (user, appointment, etc.) returns jest.fn() stubs
 * so individual tests can override behaviour with mockResolvedValue / mockRejectedValue.
 */
export const mockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  appointment: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  providerProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  patientProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  availabilitySlot: {
    findMany: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
});
