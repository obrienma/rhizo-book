import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvailabilitySlotEntity {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 3, description: 'Profile ID of the provider' })
  providerId: number;

  @ApiProperty({ example: 1, description: '0 = Sunday … 6 = Saturday' })
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:MM format' })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time in HH:MM format' })
  endTime: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class ProviderProfileDetailEntity {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 7 })
  userId: number;

  @ApiPropertyOptional({ example: 'Cardiology' })
  specialty: string | null;

  @ApiPropertyOptional({ example: 'Board-certified cardiologist with 15 years of experience.' })
  bio: string | null;

  @ApiPropertyOptional({ example: 'MD-2048-CA' })
  licenseNumber: string | null;

  @ApiProperty({ example: 30, description: 'Appointment slot duration in minutes' })
  appointmentDuration: number;

  @ApiProperty({ type: () => AvailabilitySlotEntity, isArray: true })
  availabilitySlots: AvailabilitySlotEntity[];
}

export class ProviderEntity {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 'Dr. Bob Johnson' })
  name: string;

  @ApiProperty({ example: 'bob.provider@example.com' })
  email: string;

  @ApiPropertyOptional({ type: () => ProviderProfileDetailEntity })
  providerProfile: ProviderProfileDetailEntity | null;
}
