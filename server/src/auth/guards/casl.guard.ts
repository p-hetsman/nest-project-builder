import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY } from '../policies/constants';
import { defineAbilitiesFor } from '../policies/policies';

import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private usersService: UsersService,
  ) { }
  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers.authorization;
    const [type, token] = authorizationHeader
      ? authorizationHeader.split(' ')
      : [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<string[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    if (!policyHandlers) {
      return true; // No policies defined, allow access
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('token is missing.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      request['user'] = payload;

      const user = (
        await this.usersService.findByIdWithRoleDetails(payload.sub)
      )[0];
      if (!user || !user.role) {
        throw new UnauthorizedException('User or role not found.');
      }
      const [action, resource] = policyHandlers[0].split('_');
      const abilities = defineAbilitiesFor(user, { action, resource });
      const allowed = policyHandlers.every((handler) => {
        const [action, resource] = handler.split('_');
        return abilities.can(action, resource);
      });

      return allowed;
    } catch (error) {
      throw new UnauthorizedException('Permission denied.');
    }
  }
}
