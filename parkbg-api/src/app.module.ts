import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CitiesModule } from './cities/cities.module';
import { ZonesModule } from './zones/zones.module';
import { ParkingsModule } from './parkings/parkings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CitiesModule,
    ZonesModule,
    ParkingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
