import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new account and automatically generates a provider or patient profile ' +
      'based on the roleId. Returns the created user object and a JWT access token.',
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
      'Authenticates an existing user and returns a JWT access token. ' +
      'Use the returned access_token as a Bearer token on all protected endpoints.',
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