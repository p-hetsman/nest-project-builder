import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import 'dotenv/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.NEST_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NEST_PUBLIC_GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Here you can implement your own logic to validate the user
    // and create or retrieve the user from your database
    // For example, you can check if the user already exists in your database
    // based on the profile information returned by Google

    const user = await this.authService.validateUser(profile.emails[0].value);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
