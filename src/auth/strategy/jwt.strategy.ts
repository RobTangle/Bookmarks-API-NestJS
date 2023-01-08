import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // es false por default
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  // VALIDATE:
  async validate(payload: { sub: number; email: string }) {
    console.log({ payload });
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.hash;
    return user;
    // Si retorno null., va a tirar un error. Por lo que si no encuntra el usuario, automáticamente un error 401 se va a tirar.
  }
}
