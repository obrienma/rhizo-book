import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description: 'Returns every user (password excluded). Requires a valid JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of user objects (password omitted).',
    type: UserEntity,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Returns full user details including role and profile. Password is omitted.',
  })
  @ApiParam({ name: 'id', description: 'Numeric user ID', example: 12 })
  @ApiResponse({
    status: 200,
    description: 'User object with role and profile.',
    type: UserEntity,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
