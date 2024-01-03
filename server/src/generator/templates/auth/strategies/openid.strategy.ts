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
import 'dotenv/config';

export const buildOpenIdClient = async () => {
  const TrustIssuer = await Issuer.discover(process.env.TRUST_ISSUER_URL);

  const client = new TrustIssuer.Client({
    client_id: process.env.NEST_PUBLIC_OPENID_CLIENT_ID,
    client_secret: process.env.OPENID_CLIENT_SECRET,
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
        redirect_uri: process.env.NEST_PUBLIC_OPENID_CALLBACK_URL,
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
