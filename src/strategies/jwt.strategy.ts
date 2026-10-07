import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const data = request?.cookies['token'];
          if (!data) return null;
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_TOKEN!,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
