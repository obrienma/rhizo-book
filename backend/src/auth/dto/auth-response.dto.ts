import { ApiProperty } from '@nestjs/swagger';

class RoleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'patient', enum: ['provider', 'patient'] })
  name: string;
}

class AuthUserDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'alice.patient@example.com' })
  email: string;

  @ApiProperty({ example: 'Alice Smith' })
  name: string;

  @ApiProperty({ example: 2 })
  roleId: number;

  @ApiProperty({ type: () => RoleDto })
  role: RoleDto;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-02-01T12:30:00.000Z' })
  updatedAt: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: () => AuthUserDto })
  user: AuthUserDto;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJlbWFpbCI6ImFsaWNlLnBhdGllbnRAZXhhbXBsZS5jb20iLCJyb2xlTmFtZSI6InBhdGllbnQiLCJpYXQiOjE3MDAwMDAwMDB9.abc123',
    description:
      'JWT access token — pass as Bearer <token> in Authorization header',
  })
  access_token: string;
}
