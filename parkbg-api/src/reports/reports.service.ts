import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, user?: any) {
    if (!data.targetType || !data.targetId || !data.reason) {
      throw new BadRequestException('Липсват данни за сигнала');
    }

    if (data.targetType === 'PARKING') {
      const parking = await this.prisma.client.parking.findUnique({
        where: { id: data.targetId },
      });

      if (!parking) throw new NotFoundException('Паркингът не е намерен');

      return this.prisma.client.report.create({
        data: {
          targetType: 'PARKING',
          targetId: data.targetId,
          parkingId: data.targetId,
          userId: user?.userId || null,
          reason: data.reason,
          note: data.note || null,
        },
      });
    }

    if (data.targetType === 'ZONE') {
      const zone = await this.prisma.client.zone.findUnique({
        where: { id: data.targetId },
      });

      if (!zone) throw new NotFoundException('Зоната не е намерена');

      return this.prisma.client.report.create({
        data: {
          targetType: 'ZONE',
          targetId: data.targetId,
          zoneId: data.targetId,
          userId: user?.userId || null,
          reason: data.reason,
          note: data.note || null,
        },
      });
    }

    throw new BadRequestException('Невалиден тип сигнал');
  }

  async markActionTaken(id: string, note: string, user: any) {
    const report = await this.prisma.client.report.findUnique({
      where: { id },
      include: { parking: true, zone: true },
    });

    if (!report) throw new NotFoundException('Сигналът не е намерен');

    const isOwner =
      user.role === 'OWNER' &&
      ((report.parking &&
        report.parking.organizationId === user.organizationId) ||
        (report.zone && report.zone.organizationId === user.organizationId));

    if (!isOwner && user.role !== 'ADMIN') {
      throw new ForbiddenException('Нямаш достъп');
    }

    return this.prisma.client.report.update({
      where: { id },
      data: {
        actionTakenAt: new Date(),
        ownerNote: note || null,
        status: 'REVIEWED',
      },
    });
  }

  async resolve(id: string, note: string, user: any) {
    const report = await this.prisma.client.report.findUnique({
      where: { id },
    });

    if (!report) throw new NotFoundException('Сигналът не е намерен');

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Само админ може да затваря сигнали');
    }

    return this.prisma.client.report.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        adminNote: note || null,
        status: 'RESOLVED',
      },
    });
  }
  async markSeen(id: string, user: any) {
    const report = await this.prisma.client.report.findUnique({
      where: { id },
      include: { parking: true, zone: true },
    });

    if (!report) throw new NotFoundException('Сигналът не е намерен');

    if (user.role === 'ADMIN') {
      return this.prisma.client.report.update({
        where: { id },
        data: { adminSeenAt: new Date() },
      });
    }

    const isOwner =
      user.role === 'OWNER' &&
      ((report.parking &&
        report.parking.organizationId === user.organizationId) ||
        (report.zone && report.zone.organizationId === user.organizationId));

    if (!isOwner) throw new ForbiddenException('Нямаш достъп');

    return this.prisma.client.report.update({
      where: { id },
      data: { ownerSeenAt: new Date() },
    });
  }
  async findAllForUser(user: any) {
    if (user.role === 'ADMIN') {
      return this.prisma.client.report.findMany({
        include: {
          user: true,
          parking: true,
          zone: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === 'OWNER') {
      return this.prisma.client.report.findMany({
        where: {
          OR: [
            {
              parking: {
                organizationId: user.organizationId,
              },
            },
            {
              zone: {
                organizationId: user.organizationId,
              },
            },
          ],
        },
        include: {
          user: true,
          parking: true,
          zone: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('Нямаш достъп до сигналите');
  }

  async updateStatus(id: string, status: string, user: any) {
    if (!['OPEN', 'REVIEWED', 'RESOLVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Невалиден статус');
    }

    const report = await this.prisma.client.report.findUnique({
      where: { id },
      include: {
        parking: true,
        zone: true,
      },
    });

    if (!report) throw new NotFoundException('Сигналът не е намерен');

    const isAdmin = user.role === 'ADMIN';
    const isOwner =
      user.role === 'OWNER' &&
      ((report.parking &&
        report.parking.organizationId === user.organizationId) ||
        (report.zone && report.zone.organizationId === user.organizationId));

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Нямаш право да променяш този сигнал');
    }

    return this.prisma.client.report.update({
      where: { id },
      data: {
        status: status as any,
      },
      include: {
        user: true,
        parking: true,
        zone: true,
      },
    });
  }
}
