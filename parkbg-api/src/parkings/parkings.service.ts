import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParkingsService {
  constructor(private prisma: PrismaService) {}

  async findByCity(cityId: string) {
    return this.prisma.client.parking.findMany({
      where: {
        cityId,
        isActive: true,
        status: 'APPROVED',
      },
    });
  }
}
