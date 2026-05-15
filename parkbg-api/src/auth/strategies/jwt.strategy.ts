import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

function cookieExtractor(req: any): string | null {
  if (!req || !req.cookies) return null;
  return req.cookies.access_token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing');
    }

    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      role: payload.role,
      ownerType: payload.ownerType,
      organizationId: payload.organizationId,
      isVerified: payload.isVerified,
    };
  }
}
