import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProviderEntity } from './entities/provider.entity';

@ApiTags('Providers')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'providers', version: '1' })
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all providers',
    description:
      'Returns all users with the provider role, including their provider profile. ' +
      'Used by patients to browse available doctors before booking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of provider objects with basic profile info.',
    type: ProviderEntity,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a provider by ID',
    description:
      'Returns a specific provider\'s details including their profile and active ' +
      'availability slots, used to populate the booking page.',
  })
  @ApiParam({ name: 'id', description: 'Numeric provider user ID', example: 7 })
  @ApiResponse({
    status: 200,
    description: 'Provider object with profile and active availability slots.',
    type: ProviderEntity,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(+id);
  }
}
