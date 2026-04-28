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
import { CreateParkingDto } from './dto/create-parking.dto';
import { ParkingsService } from './parkings.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('parkings')
export class ParkingsController {
  constructor(private service: ParkingsService) {}

  @Get()
  async getParkings(@Query('cityId') cityId: string) {
    if (!cityId) return [];
    return this.service.findByCity(cityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createParking(@Body() dto: CreateParkingDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPendingParkings(@Req() req: any) {
    return this.service.findPending(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status/:status')
  async updateParkingStatus(
    @Param('id') id: string,
    @Param('status') status: 'APPROVED' | 'REJECTED',
    @Req() req: any,
  ) {
    return this.service.updateStatus(id, status, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllParkings(@Req() req: any) {
    return this.service.findAllForUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getParking(@Param('id') id: string, @Req() req: any) {
    return this.service.findOneForUser(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateParking(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.updateParkingForUser(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteParking(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteParkingForUser(id, req.user);
  }
}
