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
import { CreateParkingDto } from './dto/create-parking.dto';
import { ParkingsService } from './parkings.service';

@Controller('parkings')
export class ParkingsController {
  constructor(private service: ParkingsService) {}

  @Get()
  async getParkings(@Query('cityId') cityId: string) {
    if (!cityId) return [];
    return this.service.findByCity(cityId);
  }

  @Post()
  async createParking(@Body() dto: CreateParkingDto) {
    return this.service.create(dto);
  }

  @Get('pending')
  async getPendingParkings() {
    return this.service.findPending();
  }

  @Patch(':id/status/:status')
  async updateParkingStatus(
    @Param('id') id: string,
    @Param('status') status: 'APPROVED' | 'REJECTED',
  ) {
    return this.service.updateStatus(id, status);
  }
  @Get('all')
  async getAllParkings() {
    return this.service.findAll();
  }

  @Get(':id')
  async getParking(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async updateParking(@Param('id') id: string, @Body() body: any) {
    return this.service.updateParking(id, body);
  }

  @Delete(':id')
  async deleteParking(@Param('id') id: string) {
    return this.service.deleteParking(id);
  }
}
