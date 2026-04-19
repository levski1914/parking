import { Controller, Get, Query } from '@nestjs/common';
import { ZonesService } from './zones.service';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  async getZones(@Query('cityId') cityId: string) {
    if (!cityId) {
      return [];
    }

    return this.zonesService.findByCity(cityId);
  }
}
