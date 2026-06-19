import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchOptionsEntity {
  @ApiProperty({
    example: ['Cardiology', 'Dermatology', 'Family Medicine', 'Neurology', 'Pediatrics'],
    description: 'Distinct specialties across all provider profiles, sorted A–Z',
    type: [String],
  })
  specialties: string[];

  @ApiProperty({
    example: ['Calgary', 'Montreal', 'Ottawa', 'Toronto', 'Vancouver'],
    description: 'Distinct cities across all provider profiles, sorted A–Z',
    type: [String],
  })
  cities: string[];

  @ApiProperty({
    example: ['AB', 'BC', 'ON', 'QC'],
    description: 'Distinct province codes across all provider profiles, sorted A–Z',
    type: [String],
  })
  provinces: string[];
}

export class AvailabilitySlotEntity {
  @ApiProperty({ example: 85 })
  id: number;

  @ApiProperty({ example: 1, description: 'Profile ID of the provider' })
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
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiPropertyOptional({ example: 'Family Medicine' })
  specialty: string | null;

  @ApiPropertyOptional({ example: 'Board-certified family physician with 12 years of experience treating patients of all ages.' })
  bio: string | null;

  @ApiPropertyOptional({ example: 'Toronto' })
  city: string | null;

  @ApiPropertyOptional({ example: 'ON' })
  province: string | null;

  @ApiPropertyOptional({ example: 'MD-10021-CA' })
  licenseNumber: string | null;

  @ApiProperty({ example: 30, description: 'Appointment slot duration in minutes' })
  appointmentDuration: number;

  @ApiProperty({ type: () => AvailabilitySlotEntity, isArray: true })
  availabilitySlots: AvailabilitySlotEntity[];
}

export class ProviderEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sarah Johnson' })
  name: string;

  @ApiProperty({ example: 'sarah.johnson@clinic.com' })
  email: string;

  @ApiPropertyOptional({ type: () => ProviderProfileDetailEntity })
  providerProfile: ProviderProfileDetailEntity | null;
}
