import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 7,
    description: 'User ID of the provider to book with',
  })
  @IsInt()
  providerId: number;

  @ApiProperty({
    example: '2026-03-15T09:00:00.000Z',
    description: 'Appointment start time (ISO 8601)',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    example: '2026-03-15T09:30:00.000Z',
    description: 'Appointment end time (ISO 8601)',
  })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    example: 'Annual checkup and blood pressure review.',
    description: 'Optional notes for the appointment',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
