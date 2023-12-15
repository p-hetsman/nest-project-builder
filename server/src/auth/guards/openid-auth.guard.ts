import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OpenidAuthGuard extends AuthGuard('openid') {}
