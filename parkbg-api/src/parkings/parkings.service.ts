import { Injectable } from '@nestjs/common';
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

  async create(dto: CreateParkingDto) {
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
        status: 'PENDING',
        isActive: true,
      },
    });
  }

  async findPending() {
    return this.prisma.client.parking.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        city: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    return this.prisma.client.parking.update({
      where: { id },
      data: { status },
    });
  }
}
