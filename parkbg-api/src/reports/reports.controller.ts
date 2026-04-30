import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  createGuest(@Body() body: any) {
    return this.reportsService.create(body, null);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth')
  createAuth(@Body() body: any, @Req() req: any) {
    return this.reportsService.create(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.reportsService.findAllForUser(req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/seen')
  markSeen(@Param('id') id: string, @Req() req: any) {
    return this.reportsService.markSeen(id, req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/action')
  markAction(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.reportsService.markActionTaken(id, body.note, req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.reportsService.resolve(id, body.note, req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status/:status')
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @Req() req: any,
  ) {
    return this.reportsService.updateStatus(id, status, req.user);
  }
}
