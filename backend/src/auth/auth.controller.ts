import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new account and automatically generates a provider or patient profile ' +
      'based on the roleId. Returns the created user object and a JWT access token.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      newPatient: {
        summary: 'New patient',
        value: { email: 'new.patient@example.com', name: 'Jane Smith', password: 'password123', roleId: 2 },
      },
      newProvider: {
        summary: 'New provider',
        value: { email: 'new.provider@clinic.com', name: 'Dr. Emily Chen', password: 'password123', roleId: 1 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Returns user object and JWT access token.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed (missing / invalid fields)' })
  @ApiResponse({ status: 409, description: 'Email address is already registered' })
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates an existing user and returns a JWT access token.\n\n' +
      'All seed accounts use the password **password123**. ' +
      'Copy the `access_token` from the response, then click the 🔒 **Authorize** button ' +
      'at the top of this page and paste it to unlock the protected endpoints.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      patient: {
        summary: 'Patient — Alice Smith',
        value: { email: 'alice.smith@email.com', password: 'password123' },
      },
      provider: {
        summary: 'Provider — Sarah Johnson (Family Medicine)',
        value: { email: 'sarah.johnson@clinic.com', password: 'password123' },
      },
      patientJames: {
        summary: 'Patient — James Nguyen',
        value: { email: 'james.nguyen@email.com', password: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns user object and JWT access token.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
