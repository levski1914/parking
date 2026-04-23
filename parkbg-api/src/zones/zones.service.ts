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
  async createZone(data: {
    cityId: string;
    name: string;
    zoneType: 'BLUE' | 'GREEN' | 'PINK' | 'OTHER';
    priceText: string;
    smsNumber?: string;
    smsTemplate?: string;
    polygonGeoJson: any;
  }) {
    return this.prisma.client.zone.create({
      data: {
        cityId: data.cityId,
        name: data.name,
        zoneType: data.zoneType,
        priceText: data.priceText,
        smsNumber: data.smsNumber || null,
        smsTemplate: data.smsTemplate || null,
        polygonGeoJson: data.polygonGeoJson,
        isActive: true,
      },
    });
  }
  async findAllByCity(cityId: string) {
    return this.prisma.client.zone.findMany({
      where: { cityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteZone(id: string) {
    return this.prisma.client.zone.delete({
      where: { id },
    });
  }
  async updateZone(id: string, data: any) {
    return this.prisma.client.zone.update({
      where: { id },
      data,
    });
  }
}
