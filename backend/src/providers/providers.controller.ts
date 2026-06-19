import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { ProviderEntity, SearchOptionsEntity } from './entities/provider.entity';

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
    schema: {
      type: 'string',
      default: 'Family Medicine',
      enum: [
        'Cardiology',
        'Dermatology',
        'Family Medicine',
        'Neurology',
        'Pediatrics',
      ],
    },
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Case-insensitive partial match on provider city',
    schema: {
      type: 'string',
      default: 'Toronto',
      enum: [
        'Calgary',
        'Montreal',
        'Ottawa',
        'Toronto',
        'Vancouver',
      ],
    },
  })
  @ApiQuery({
    name: 'province',
    required: false,
    description: 'Case-insensitive partial match on provider province',
    schema: {
      type: 'string',
      default: 'ON',
      enum: ['AB', 'BC', 'ON', 'QC'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Array of provider objects with basic profile info.',
    type: ProviderEntity,
    isArray: true,
  })
  findAll(
    @Query('specialty') specialty?: string,
    @Query('city') city?: string,
    @Query('province') province?: string,
  ) {
    return this.providersService.findAll(specialty, city, province);
  }

  @Get('options')
  @ApiOperation({
    summary: 'Get distinct search filter values',
    description:
      'Returns distinct non-null values for specialty, city, and province across all provider profiles. ' +
      'Used to populate autocomplete suggestions in the search UI. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Distinct specialties, cities, and provinces sorted A–Z.',
    type: SearchOptionsEntity,
  })
  getSearchOptions() {
    return this.providersService.findSearchOptions();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a provider by ID',
    description:
      "Returns a specific provider's details including their profile and active " +
      'availability slots. Public endpoint — no authentication required.',
  })
  @ApiParam({ name: 'id', description: 'Numeric provider user ID', example: 1 })
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
