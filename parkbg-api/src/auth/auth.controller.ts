import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OwnerType, UserRole } from 'src/generated/prisma/browser';
import { OwnerTypes } from './decorators/owner-types.decorator';
import { OwnerTypeGuard } from './guards/owner-type.guard';
import { RegisterDto } from './dto/register.dto';

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.register(dto);
    res.cookie('access_token', token, cookieOptions());
    return { ok: true };
  }

  @Post('login')
  async login(@Body() dto: any, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.login(dto);
    res.cookie('access_token', token, cookieOptions());
    return { ok: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      path: '/',
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });

    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  getAdminData() {
    return 'Only admin';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('create-parking')
  createParking() {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile() {}

  @UseGuards(JwtAuthGuard, RolesGuard, OwnerTypeGuard)
  @Roles(UserRole.OWNER)
  @OwnerTypes(OwnerType.MUNICIPALITY)
  @Post('zones')
  createZone() {}

  @UseGuards(JwtAuthGuard, RolesGuard, OwnerTypeGuard)
  @Roles(UserRole.OWNER)
  @OwnerTypes(OwnerType.PRIVATE)
  @Post('parkings/private')
  createPrivateParking() {}

  @UseGuards(JwtAuthGuard, RolesGuard, OwnerTypeGuard)
  @Roles(UserRole.OWNER)
  @OwnerTypes(OwnerType.MUNICIPALITY)
  @Post('parkings/municipal')
  createMunicipalParking() {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('anything')
  deleteEverything() {}
}
