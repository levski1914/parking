import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Имейлът вече съществува');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    // 👤 CLIENT
    if (dto.role === 'CLIENT') {
      const user = await this.prisma.client.user.create({
        data: {
          email: dto.email,
          passwordHash: hashed,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'CLIENT',
        },
      });

      return this.generateToken(user);
    }

    // 🏢 OWNER (община / фирма)
    if (dto.role === 'OWNER') {
      if (!dto.ownerType || !dto.organizationName || !dto.cityId) {
        throw new BadRequestException('Липсват данни за организация');
      }

      const organization = await this.prisma.client.organization.create({
        data: {
          name: dto.organizationName,
          type: dto.ownerType,
          cityId: dto.cityId,
        },
      });

      const user = await this.prisma.client.user.create({
        data: {
          email: dto.email,
          passwordHash: hashed,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'OWNER',
          ownerType: dto.ownerType,
          organizationId: organization.id,
          isVerified: false, // 🔥 важно
        },
      });

      return this.generateToken(user);
    }

    throw new BadRequestException('Невалидна роля');
  }
  async login(dto: any) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  generateToken(user: any) {
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        role: user.role,
        ownerType: user.ownerType,
        organizationId: user.organizationId,
      }),
    };
  }
}
