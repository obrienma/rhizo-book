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
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { AppointmentEntity } from './entities/appointment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Appointments')
@Controller({ path: 'appointments', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Book a new appointment',
    description:
      'Creates an appointment between the authenticated patient and the specified provider. ' +
      'The API checks for double-booking conflicts before persisting. ' +
      'startTime and endTime must be valid ISO 8601 datetimes and endTime must be after startTime.',
  })
  @ApiBody({
    type: CreateAppointmentDto,
    examples: {
      familyMedicine: {
        summary: 'Sarah Johnson — Family Medicine (30 min)',
        description: 'Book a 30-minute slot with Dr. Sarah Johnson (provider ID 1)',
        value: {
          providerId: 1,
          startTime: '2026-08-04T09:00:00.000Z',
          endTime: '2026-08-04T09:30:00.000Z',
          notes: 'Annual checkup and blood pressure review.',
        },
      },
      cardiology: {
        summary: 'Mike Chen — Cardiology (45 min)',
        description: 'Book a 45-minute slot with Dr. Mike Chen (provider ID 2)',
        value: {
          providerId: 2,
          startTime: '2026-08-05T08:00:00.000Z',
          endTime: '2026-08-05T08:45:00.000Z',
          notes: 'Cardiology follow-up.',
        },
      },
      psychiatry: {
        summary: 'Sophie Dubois — Psychiatry (50 min)',
        description: 'Book a 50-minute slot with Dr. Sophie Dubois (provider ID 7)',
        value: {
          providerId: 7,
          startTime: '2026-08-04T11:00:00.000Z',
          endTime: '2026-08-04T11:50:00.000Z',
          notes: 'Stress management session.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment created. Returns the full appointment object.',
    type: AppointmentEntity,
  })
  @ApiResponse({ status: 400, description: 'Validation failed (invalid dates, missing fields)' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({
    status: 409,
    description: 'The requested time slot overlaps an existing scheduled appointment for this provider',
  })
  create(
    @Body(ValidationPipe) createDto: CreateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentsService.create(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List appointments for the current user',
    description:
      'Returns all appointments belonging to the authenticated user. ' +
      'Providers see appointments where they are the provider; ' +
      'patients see appointments where they are the patient. ' +
      'Results are ordered by startTime ascending.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of appointment objects ordered by startTime ascending.',
    type: AppointmentEntity,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user.id, req.user.role.name);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single appointment by ID',
    description:
      'Returns the full appointment including provider and patient details. ' +
      'Both the provider and the patient of the appointment may access it; ' +
      'any other user receives 403.',
  })
  @ApiParam({ name: 'id', description: 'Numeric appointment ID', example: 83 })
  @ApiResponse({
    status: 200,
    description: 'Full appointment object with provider and patient detail.',
    type: AppointmentEntity,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Authenticated user is not a participant of this appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.findOne(+id, req.user.id, req.user.role.name);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel an appointment',
    description:
      'Sets the appointment status to CANCELLED and optionally records a reason. ' +
      'Only appointments in SCHEDULED status can be cancelled. ' +
      'Both the provider and the patient may cancel.',
  })
  @ApiParam({ name: 'id', description: 'Numeric appointment ID', example: 109 })
  @ApiBody({
    type: CancelAppointmentDto,
    examples: {
      withReason: {
        summary: 'Cancel with a reason',
        value: { reason: 'Schedule conflict — need to reschedule.' },
      },
      noReason: {
        summary: 'Cancel with no reason (reason is optional)',
        value: {},
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment successfully cancelled. Returns updated appointment object.',
    type: AppointmentEntity,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Authenticated user is not a participant of this appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Appointment is not in SCHEDULED status and cannot be cancelled' })
  cancel(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) cancelDto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(+id, req.user.id, req.user.role.name, cancelDto.reason);
  }
}
