import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CitiesModule } from './cities/cities.module';
import { ZonesModule } from './zones/zones.module';
import { ParkingsModule } from './parkings/parkings.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CitiesModule,
    ZonesModule,
    ParkingsModule,
    AuthModule,
    UsersModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
