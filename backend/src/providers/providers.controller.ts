import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({ status: 200, description: 'Return all providers' })
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiResponse({ status: 200, description: 'Return provider details' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(+id);
  }
}
