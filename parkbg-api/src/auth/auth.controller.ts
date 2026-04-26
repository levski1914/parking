import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
// import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OwnerType, UserRole } from 'src/generated/prisma/browser';
import { OwnerTypes } from './decorators/owner-types.decorator';
import { OwnerTypeGuard } from './guards/owner-type.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: any) {
    return this.authService.login(dto);
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
