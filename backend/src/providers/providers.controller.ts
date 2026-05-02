import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { ProviderEntity } from './entities/provider.entity';

@ApiTags('Providers')
@Controller({ path: 'providers', version: '1' })
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all providers',
    description:
      'Returns all users with the provider role, including their provider profile. ' +
      'Optionally filter by specialty. Public endpoint — no authentication required.',
  })
  @ApiQuery({
    name: 'specialty',
    required: false,
    description: 'Case-insensitive partial match on provider specialty',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of provider objects with basic profile info.',
    type: ProviderEntity,
    isArray: true,
  })
  findAll(@Query('specialty') specialty?: string) {
    return this.providersService.findAll(specialty);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a provider by ID',
    description:
      "Returns a specific provider's details including their profile and active " +
      'availability slots. Public endpoint — no authentication required.',
  })
  @ApiParam({ name: 'id', description: 'Numeric provider user ID', example: 7 })
  @ApiResponse({
    status: 200,
    description: 'Provider object with profile and active availability slots.',
    type: ProviderEntity,
  })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(+id);
  }
}
