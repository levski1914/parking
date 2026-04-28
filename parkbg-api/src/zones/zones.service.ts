import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async createZone(
    data: {
      cityId: string;
      name: string;
      zoneType: 'BLUE' | 'GREEN' | 'PINK' | 'OTHER';
      priceText: string;
      smsNumber?: string;
      smsTemplate?: string;
      polygonGeoJson: any;
    },
    user: any,
  ) {
    if (user.role === 'ADMIN') {
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

    if (
      user.role !== 'OWNER' ||
      user.ownerType !== 'MUNICIPALITY' ||
      !user.isVerified
    ) {
      throw new ForbiddenException('Нямаш право да създаваш зони');
    }

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
        ownerUserId: user.userId,
        organizationId: user.organizationId,
      },
    });
  }

  async findAllForUser(user: any) {
    if (user.role === 'ADMIN') {
      return this.prisma.client.zone.findMany({
        include: {
          city: true,
          organization: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (
      user.role === 'OWNER' &&
      user.ownerType === 'MUNICIPALITY' &&
      user.isVerified
    ) {
      return this.prisma.client.zone.findMany({
        where: {
          organizationId: user.organizationId,
        },
        include: {
          city: true,
          organization: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    throw new ForbiddenException('Нямаш достъп до зоните');
  }

  async findOneForUser(id: string, user: any) {
    const zone = await this.prisma.client.zone.findUnique({
      where: { id },
      include: {
        city: true,
        organization: true,
      },
    });

    if (!zone) {
      throw new NotFoundException('Зоната не е намерена');
    }

    if (user.role !== 'ADMIN' && zone.organizationId !== user.organizationId) {
      throw new ForbiddenException('Нямаш достъп до тази зона');
    }

    return zone;
  }

  async updateZoneForUser(id: string, data: any, user: any) {
    const zone = await this.prisma.client.zone.findUnique({
      where: { id },
    });

    if (!zone) {
      throw new NotFoundException('Зоната не е намерена');
    }

    if (user.role !== 'ADMIN' && zone.organizationId !== user.organizationId) {
      throw new ForbiddenException('Нямаш право да редактираш тази зона');
    }

    return this.prisma.client.zone.update({
      where: { id },
      data,
    });
  }

  async deleteZoneForUser(id: string, user: any) {
    const zone = await this.prisma.client.zone.findUnique({
      where: { id },
    });

    if (!zone) {
      throw new NotFoundException('Зоната не е намерена');
    }

    if (user.role !== 'ADMIN' && zone.organizationId !== user.organizationId) {
      throw new ForbiddenException('Нямаш право да изтриеш тази зона');
    }

    return this.prisma.client.zone.delete({
      where: { id },
    });
  }
}
