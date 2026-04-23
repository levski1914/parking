import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ZonesService } from './zones.service';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  async getZones(@Query('cityId') cityId?: string) {
    if (!cityId) return [];
    return this.zonesService.findByCity(cityId);
  }

  @Post()
  async createZone(@Body() body: any) {
    return this.zonesService.createZone(body);
  }
  @Delete(':id')
  async deleteZone(@Param('id') id: string) {
    return this.zonesService.deleteZone(id);
  }
  @Patch(':id')
  updateZone(@Param('id') id: string, @Body() body: any) {
    return this.zonesService.updateZone(id, body);
  }
}
