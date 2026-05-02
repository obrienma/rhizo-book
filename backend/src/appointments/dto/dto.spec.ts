import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAppointmentDto } from './create-appointment.dto';
import { CancelAppointmentDto } from './cancel-appointment.dto';

describe('Appointment DTOs', () => {
  // ─── CreateAppointmentDto ──────────────────────────────────────

  describe('CreateAppointmentDto', () => {
    const validData = {
      providerId: 7,
      startTime: '2026-03-15T09:00:00.000Z',
      endTime: '2026-03-15T09:30:00.000Z',
    };

    it('should pass with valid data', async () => {
      const dto = plainToInstance(CreateAppointmentDto, validData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with optional notes', async () => {
      const dto = plainToInstance(CreateAppointmentDto, { ...validData, notes: 'Checkup' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when providerId is missing', async () => {
      const dto = plainToInstance(CreateAppointmentDto, { ...validData, providerId: undefined });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when providerId is not an integer', async () => {
      const dto = plainToInstance(CreateAppointmentDto, { ...validData, providerId: 'abc' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when startTime is not a valid date string', async () => {
      const dto = plainToInstance(CreateAppointmentDto, { ...validData, startTime: 'not-a-date' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when endTime is missing', async () => {
      const dto = plainToInstance(CreateAppointmentDto, { ...validData, endTime: undefined });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ─── CancelAppointmentDto ─────────────────────────────────────

  describe('CancelAppointmentDto', () => {
    it('should pass with no reason (all fields optional)', async () => {
      const dto = plainToInstance(CancelAppointmentDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with a string reason', async () => {
      const dto = plainToInstance(CancelAppointmentDto, { reason: 'Schedule conflict' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when reason is not a string', async () => {
      const dto = plainToInstance(CancelAppointmentDto, { reason: 123 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
