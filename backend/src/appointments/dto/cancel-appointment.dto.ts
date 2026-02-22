import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelAppointmentDto {
  @ApiPropertyOptional({
    example: 'Schedule conflict — need to reschedule.',
    description: 'Optional reason for cancellation',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
