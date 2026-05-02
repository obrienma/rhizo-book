import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';

describe('Auth DTOs', () => {
  // ─── RegisterDto ─────────────────────────────────────────────────

  describe('RegisterDto', () => {
    const validData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      roleId: 1,
    };

    it('should pass with valid data', async () => {
      const dto = plainToInstance(RegisterDto, validData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when email is missing', async () => {
      const dto = plainToInstance(RegisterDto, { ...validData, email: undefined });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail when email is invalid', async () => {
      const dto = plainToInstance(RegisterDto, { ...validData, email: 'not-an-email' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail when name is shorter than 3 characters', async () => {
      const dto = plainToInstance(RegisterDto, { ...validData, name: 'Ab' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail when password is shorter than 6 characters', async () => {
      const dto = plainToInstance(RegisterDto, { ...validData, password: '12345' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail when roleId is not an integer', async () => {
      const dto = plainToInstance(RegisterDto, { ...validData, roleId: 'abc' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('roleId');
    });

    it('should fail when roleId is missing', async () => {
      const dto = plainToInstance(RegisterDto, { ...validData, roleId: undefined });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ─── LoginDto ──────────────────────────────────────────────────

  describe('LoginDto', () => {
    const validData = { email: 'test@example.com', password: 'password123' };

    it('should pass with valid data', async () => {
      const dto = plainToInstance(LoginDto, validData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when email is missing', async () => {
      const dto = plainToInstance(LoginDto, { password: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when email is invalid', async () => {
      const dto = plainToInstance(LoginDto, { ...validData, email: 'bad' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when password is missing', async () => {
      const dto = plainToInstance(LoginDto, { email: 'test@example.com' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
