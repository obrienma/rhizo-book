import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  providerId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
