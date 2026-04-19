import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCity(cityId: string) {
    return this.prisma.client.zone.findMany({
      where: {
        cityId,
        isActive: true,
      },
    });
  }
}
