import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentUserEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sarah Johnson' })
  name: string;

  @ApiProperty({ example: 'sarah.johnson@clinic.com' })
  email: string;
}

export class AppointmentEntity {
  @ApiProperty({ example: 83 })
  id: number;

  @ApiProperty({ example: 1, description: 'Provider user ID' })
  providerId: number;

  @ApiProperty({ example: 28, description: 'Patient user ID' })
  patientId: number;

  @ApiProperty({ example: '2026-07-15T09:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2026-07-15T09:30:00.000Z' })
  endTime: string;

  @ApiProperty({
    example: 'SCHEDULED',
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
  })
  status: string;

  @ApiPropertyOptional({ example: 'Annual checkup and blood pressure review.' })
  notes: string | null;

  @ApiPropertyOptional({ example: null })
  cancellationReason: string | null;

  @ApiProperty({ type: () => AppointmentUserEntity })
  provider: AppointmentUserEntity;

  @ApiProperty({ type: () => AppointmentUserEntity })
  patient: AppointmentUserEntity;

  @ApiProperty({ example: '2026-02-20T14:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-02-20T14:00:00.000Z' })
  updatedAt: string;
}
