import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAppointmentDto, patientId: number) {
    // Check for conflicts/double-booking
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        providerId: createDto.providerId,
        status: AppointmentStatus.SCHEDULED,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(createDto.startTime) } },
              { endTime: { gt: new Date(createDto.startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(createDto.endTime) } },
              { endTime: { gte: new Date(createDto.endTime) } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      throw new ConflictException('Time slot is already booked');
    }

    return this.prisma.appointment.create({
      data: {
        providerId: createDto.providerId,
        patientId,
        startTime: new Date(createDto.startTime),
        endTime: new Date(createDto.endTime),
        notes: createDto.notes,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        provider: {
          select: { id: true, name: true, email: true },
        },
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAll(userId: number, userRole: string) {
    const where =
      userRole === 'provider'
        ? { providerId: userId }
        : { patientId: userId };

    return this.prisma.appointment.findMany({
      where,
      include: {
        provider: {
          select: { id: true, name: true, email: true },
        },
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, email: true, providerProfile: true },
        },
        patient: {
          select: { id: true, name: true, email: true, patientProfile: true },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Authorization check
    if (
      appointment.providerId !== userId &&
      appointment.patientId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return appointment;
  }

  async cancel(
    id: number,
    userId: number,
    userRole: string,
    reason?: string,
  ) {
    const appointment = await this.findOne(id, userId, userRole);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new ConflictException('Only scheduled appointments can be cancelled');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
      },
      include: {
        provider: {
          select: { id: true, name: true, email: true },
        },
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
