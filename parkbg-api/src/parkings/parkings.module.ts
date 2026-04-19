import { Module } from '@nestjs/common';
import { ParkingsService } from './parkings.service';
import { ParkingsController } from './parkings.controller';

@Module({
  providers: [ParkingsService],
  controllers: [ParkingsController]
})
export class ParkingsModule {}
