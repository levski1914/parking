import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, user: any) {
    if (!user) {
      throw new ForbiddenException('Трябва да си влязъл в профила си');
    }

    const rating = Number(data.rating);

    if (!data.parkingId || rating < 1 || rating > 5) {
      throw new BadRequestException('Невалидни данни за отзив');
    }

    const parking = await this.prisma.client.parking.findUnique({
      where: { id: data.parkingId },
    });

    if (!parking) {
      throw new NotFoundException('Паркингът не е намерен');
    }

    return this.prisma.client.review.create({
      data: {
        parkingId: data.parkingId,
        userId: user.userId,
        rating,
        comment: data.comment || null,
      },
    });
  }

  async findByParking(parkingId: string) {
    return this.prisma.client.review.findMany({
      where: { parkingId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async summary(parkingId: string) {
    const result = await this.prisma.client.review.aggregate({
      where: { parkingId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      average: result._avg.rating ? Number(result._avg.rating.toFixed(1)) : 0,
      count: result._count.rating,
    };
  }

  async delete(id: string, user: any) {
    const review = await this.prisma.client.review.findUnique({
      where: { id },
      include: {
        parking: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Отзивът не е намерен');
    }

    const isOwnerOfReview = review.userId === user.userId;
    const isAdmin = user.role === 'ADMIN';
    const isParkingOwner =
      user.role === 'OWNER' &&
      review.parking.organizationId === user.organizationId;

    if (!isOwnerOfReview && !isAdmin && !isParkingOwner) {
      throw new ForbiddenException('Нямаш право да изтриеш този отзив');
    }

    return this.prisma.client.review.delete({
      where: { id },
    });
  }
}
