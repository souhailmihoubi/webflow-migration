import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@my-org/api-interfaces';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload & { sessionToken?: string }) {
    const user = await this.db.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Validate session token for single-session authentication
    // If user has a session token set and it doesn't match the JWT's token,
    // the session has been invalidated by a newer login
    if (
      user.currentSessionToken &&
      payload.sessionToken !== user.currentSessionToken
    ) {
      throw new UnauthorizedException(
        'Session expired. You have been logged out because this account was accessed from another device.',
      );
    }

    return { userId: user.id, email: user.email, role: user.role };
  }
}
