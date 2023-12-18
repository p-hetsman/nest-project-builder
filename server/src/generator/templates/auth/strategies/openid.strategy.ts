import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  Client,
  UserinfoResponse,
  TokenSet,
  Issuer,
} from 'openid-client';

import { AuthService } from '../auth.service';

export const buildOpenIdClient = async () => {
  const TrustIssuer = await Issuer.discover(
    `https://dev-i7t32emylmkf1awj.us.auth0.com/oidc/.well-known/openid-configuration`,
  );

  const client = new TrustIssuer.Client({
    client_id: 'cVendLmui5q5fZW3IpdBTwSD4q0M4cqa',
    client_secret:
      'l0wsHxlBGRS2nqxqm5fVXanTfPixXTqCyotvPbhHiC6UZRxqWaXvNVLVAUieUt3E',
    token_endpoint_auth_method: 'client_secret_post',
  });

  return client;
};

@Injectable()
export class OpenidStrategy extends PassportStrategy(Strategy, 'openid') {
  client: Client;

  constructor(
    client: Client,
    private authService: AuthService,
  ) {
    super({
      client: client,
      params: {
        redirect_uri: 'http://localhost:8081/auth/openid/callback',
        scope: 'openid profile email',
      },
      passReqToCallback: false,
      usePKCE: false,
    });

    this.client = client;
  }

  async validate(tokenSet: TokenSet): Promise<any> {
    const userinfo: UserinfoResponse = await this.client.userinfo(tokenSet);

    const user = await this.authService.validateUser(userinfo.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
