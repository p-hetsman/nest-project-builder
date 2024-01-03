import { Strategy } from 'passport-facebook';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import 'dotenv/config';
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.NEST_PUBLIC_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.NEST_PUBLIC_FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Here you can implement your own logic to validate the user
    // and create or retrieve the corresponding user in your database
    // based on the information provided in the profile object.

    const user = await this.authService.validateUser(profile.emails[0].value);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
