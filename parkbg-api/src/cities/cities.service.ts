import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
