import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  createUser(data: any) {
    return this.prisma.client.user.create({ data });
  }

  findPendingOwners() {
    return this.prisma.client.user.findMany({
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  approveUser(id: string) {
    return this.prisma.client.user.update({
      where: { id },
      data: { isVerified: true },
      include: {
        organization: true,
      },
    });
  }

  rejectUser(id: string) {
    return this.prisma.client.user.delete({
      where: { id },
    });
  }
}
