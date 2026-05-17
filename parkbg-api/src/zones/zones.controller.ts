import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ZonesService } from './zones.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  async getZones(@Query('cityId') cityId?: string) {
    if (!cityId) return [];
    return this.zonesService.findByCity(cityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createZone(@Body() body: any, @Req() req: any) {
    return this.zonesService.createZone(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllZones(@Req() req: any) {
    return this.zonesService.findAllForUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getZone(@Param('id') id: string, @Req() req: any) {
    return this.zonesService.findOneForUser(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateZone(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.zonesService.updateZoneForUser(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteZone(@Param('id') id: string, @Req() req: any) {
    return this.zonesService.deleteZoneForUser(id, req.user);
  }

  @Get('public/all')
  async getPublicZones() {
    return this.zonesService.findAllPublic();
  }
}
