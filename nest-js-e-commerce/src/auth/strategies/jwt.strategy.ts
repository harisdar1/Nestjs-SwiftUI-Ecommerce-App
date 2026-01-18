import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// This defines HOW to validate JWT tokens
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Where to find the token: "Bearer <token>" in Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Don't accept expired tokens
      ignoreExpiration: false,

      // Get secret from environment variable
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  // This runs AFTER the token is verified as valid
  // Whatever we return here gets attached to request.user
  async validate(payload: { sub: string; email: string; role: string }) {
    // payload is the decoded JWT data we created during login
    return {
      id: payload.sub, // sub → id (more intuitive)
      email: payload.email,
      role: payload.role,
    };
  }
}
