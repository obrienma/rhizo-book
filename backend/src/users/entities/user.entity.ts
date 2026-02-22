import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'provider', enum: ['provider', 'patient'] })
  name: string;
}

export class ProviderProfileEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 7 })
  userId: number;

  @ApiPropertyOptional({ example: 'Cardiology' })
  specialty: string | null;

  @ApiPropertyOptional({ example: 'Board-certified cardiologist with 15 years of experience.' })
  bio: string | null;

  @ApiPropertyOptional({ example: 'MD-2048-CA' })
  licenseNumber: string | null;

  @ApiProperty({ example: 30, description: 'Appointment duration in minutes' })
  appointmentDuration: number;
}

export class PatientProfileEntity {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 12 })
  userId: number;

  @ApiPropertyOptional({ example: '1990-06-15T00:00:00.000Z' })
  dateOfBirth: string | null;

  @ApiPropertyOptional({ example: '+1-555-867-5309' })
  phone: string | null;

  @ApiPropertyOptional({ example: 'No known drug allergies.' })
  medicalNotes: string | null;
}

export class UserEntity {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'alice.patient@example.com' })
  email: string;

  @ApiProperty({ example: 'Alice Smith' })
  name: string;

  @ApiProperty({ example: 2 })
  roleId: number;

  @ApiProperty({ type: () => RoleEntity })
  role: RoleEntity;

  @ApiPropertyOptional({ type: () => ProviderProfileEntity })
  providerProfile: ProviderProfileEntity | null;

  @ApiPropertyOptional({ type: () => PatientProfileEntity })
  patientProfile: PatientProfileEntity | null;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-02-01T12:30:00.000Z' })
  updatedAt: string;
}
