import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string) {
    const user = await this.usersService.findOne(username);

    return user
      ? user
      : await this.usersService.create({
          username,
          role: 'user',
        });
  }

  async generateToken(user: { _id: string; username: string }) {
    return {
      access_token: await this.jwtService.signAsync({
        sub: user._id,
        username: user.username,
      }),
    };
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return {
      access_token: await this.jwtService.signAsync({
        sub: user._id,
        username: user.username,
      }),
    };
  }

  async register(username: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await this.usersService.create({
      username,
      password: passwordHash,
      role: 'user',
    });

    return {
      id: createdUser._id,
      username: createdUser.username,
    };
  }
}
