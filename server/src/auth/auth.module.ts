import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import {
  OpenidStrategy,
  buildOpenIdClient,
} from './strategies/openid.strategy';

const OpenidStrategyFactory = {
  provide: 'OpenidStrategy',
  useFactory: async (authService: AuthService) => {
    const client = await buildOpenIdClient();
    return new OpenidStrategy(client, authService);
  },
  inject: [AuthService],
};

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '300s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    FacebookStrategy,
    OpenidStrategyFactory,
  ],
  exports: [AuthService],
})
export class AuthModule {}
