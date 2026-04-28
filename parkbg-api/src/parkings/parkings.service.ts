import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParkingDto } from './dto/create-parking.dto';

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

  async create(dto: CreateParkingDto, user: any) {
    if (user.role === 'CLIENT') {
      throw new ForbiddenException('Клиент не може да създава паркинги');
    }

    if (user.role === 'OWNER' && !user.isVerified) {
      throw new ForbiddenException('Профилът чака одобрение');
    }
    if (user.role === 'OWNER') {
      if (user.ownerType === 'PRIVATE') {
        dto.parkingType = 'PRIVATE';
      }

      if (user.ownerType === 'MUNICIPALITY') {
        dto.parkingType = 'MUNICIPAL';
      }
    }
    return this.prisma.client.parking.create({
      data: {
        cityId: dto.cityId,
        parkingType: dto.parkingType,
        name: dto.name,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        priceText: dto.priceText,
        approxCapacity: dto.approxCapacity ?? null,
        status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
        isActive: true,
        organizationId: user.role === 'OWNER' ? user.organizationId : null,
      },
    });
  }

  async findPending(user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Само админ има достъп');
    }

    return this.prisma.client.parking.findMany({
      where: {
        status: 'PENDING',
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

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED', user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Само админ може да одобрява паркинги');
    }

    return this.prisma.client.parking.update({
      where: { id },
      data: { status },
    });
  }

  async findAllForUser(user: any) {
    if (user.role === 'ADMIN') {
      return this.prisma.client.parking.findMany({
        include: {
          city: true,
          organization: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (user.role === 'OWNER') {
      return this.prisma.client.parking.findMany({
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

    throw new ForbiddenException('Нямаш достъп');
  }

  async findOneForUser(id: string, user: any) {
    const parking = await this.prisma.client.parking.findUnique({
      where: { id },
      include: {
        city: true,
        organization: true,
      },
    });

    if (!parking) {
      throw new NotFoundException('Паркингът не е намерен');
    }

    if (
      user.role !== 'ADMIN' &&
      parking.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Нямаш достъп до този паркинг');
    }

    return parking;
  }

  async updateParkingForUser(id: string, data: any, user: any) {
    const parking = await this.prisma.client.parking.findUnique({
      where: { id },
    });

    if (!parking) {
      throw new NotFoundException('Паркингът не е намерен');
    }

    if (
      user.role !== 'ADMIN' &&
      parking.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Нямаш право да редактираш този паркинг');
    }

    return this.prisma.client.parking.update({
      where: { id },
      data: {
        name: data.name,
        parkingType: data.parkingType,
        address: data.address,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        priceText: data.priceText,
        approxCapacity:
          data.approxCapacity === null || data.approxCapacity === undefined
            ? null
            : Number(data.approxCapacity),
        status: user.role === 'ADMIN' ? data.status : parking.status,
      },
    });
  }

  async deleteParkingForUser(id: string, user: any) {
    const parking = await this.prisma.client.parking.findUnique({
      where: { id },
    });

    if (!parking) {
      throw new NotFoundException('Паркингът не е намерен');
    }

    if (
      user.role !== 'ADMIN' &&
      parking.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Нямаш право да изтриеш този паркинг');
    }

    return this.prisma.client.parking.delete({
      where: { id },
    });
  }
}
