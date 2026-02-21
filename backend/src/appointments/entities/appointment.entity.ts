import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentUserEntity {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 'Bob Johnson' })
  name: string;

  @ApiProperty({ example: 'bob.provider@example.com' })
  email: string;
}

export class AppointmentEntity {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 7, description: 'Provider user ID' })
  providerId: number;

  @ApiProperty({ example: 12, description: 'Patient user ID' })
  patientId: number;

  @ApiProperty({ example: '2026-03-15T09:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2026-03-15T09:30:00.000Z' })
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
