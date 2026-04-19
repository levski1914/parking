import { Controller, Get, Query } from '@nestjs/common';
import { ParkingsService } from './parkings.service';

@Controller('parkings')
export class ParkingsController {
  constructor(private service: ParkingsService) {}

  @Get()
  async getParkings(@Query('cityId') cityId: string) {
    if (!cityId) return [];
    return this.service.findByCity(cityId);
  }
}
