import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 409, description: 'Time slot already booked (conflict)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body(ValidationPipe) createDto: CreateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentsService.create(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments for current user' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user.id, req.user.role.name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.findOne(+id, req.user.id, req.user.role.name);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for cancellation',
          example: 'Schedule conflict',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Only scheduled appointments can be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  cancel(
    @Param('id') id: string,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.appointmentsService.cancel(+id, req.user.id, req.user.role.name, reason);
  }
}
