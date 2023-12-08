import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID:
        '412427081453-8adqtvqiulq2tqvf814guui73dlvop8f.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:8080/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Here you can implement your own logic to validate the user
    // and create or retrieve the user from your database
    // For example, you can check if the user already exists in your database
    // based on the profile information returned by Google

    // const user = await this.authService.validateUser(username, password);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }

    // return user;

    // Return the user object
    return {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    };
  }
}
