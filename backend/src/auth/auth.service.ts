import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        roleId: registerDto.roleId,
      },
      include: {
        role: true,
      },
    });

    // Create profile based on role
    if (user.role.name === 'provider') {
      await this.prisma.providerProfile.create({
        data: { userId: user.id },
      });
    } else if (user.role.name === 'patient') {
      await this.prisma.patientProfile.create({
        data: { userId: user.id },
      });
    }

    const { password, ...result } = user;
    return {
      user: result,
      access_token: this.generateToken(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    return {
      user: result,
      access_token: this.generateToken(user),
    };
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, roleId: user.roleId };
    return this.jwtService.sign(payload);
  }

  async validateUser(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
  }
}
