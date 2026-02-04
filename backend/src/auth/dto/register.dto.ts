import { IsEmail, IsString, MinLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'bobprovider@test.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Bob Doe', description: 'User full name', minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'password123', description: 'User password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 1, description: 'Role ID (1 = provider, 2 = patient)' })
  @IsInt()
  roleId: number;
}
