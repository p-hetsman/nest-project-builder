import { Strategy } from 'passport-facebook';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
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

    // For example:
    const { id, displayName, emails } = profile;
    const user = {
      facebookId: id,
      name: displayName,
      email: emails[0].value,
      accessToken,
      refreshToken,
    };

    return user;
  }
}
