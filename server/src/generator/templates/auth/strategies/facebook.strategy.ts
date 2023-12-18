import { Strategy } from 'passport-facebook';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: 'YOUR_FACEBOOK_APP_ID',
      clientSecret: 'YOUR_FACEBOOK_APP_SECRET',
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
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
