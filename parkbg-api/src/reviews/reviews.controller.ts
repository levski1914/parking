import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.reviewsService.create(body, req.user);
  }

  @Get('parking/:parkingId')
  findByParking(@Param('parkingId') parkingId: string) {
    return this.reviewsService.findByParking(parkingId);
  }

  @Get('parking/:parkingId/summary')
  summary(@Param('parkingId') parkingId: string) {
    return this.reviewsService.summary(parkingId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.reviewsService.delete(id, req.user);
  }
}
