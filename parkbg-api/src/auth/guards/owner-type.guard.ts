import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNER_TYPES_KEY } from '../decorators/owner-types.decorator';
import { OwnerType } from 'src/generated/prisma/client';

@Injectable()
export class OwnerTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.getAllAndOverride<OwnerType[]>(
      OWNER_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTypes) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    return requiredTypes.includes(user.ownerType);
  }
}
