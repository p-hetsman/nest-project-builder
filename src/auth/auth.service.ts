import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // async signIn(username: string, password: string) {
  //   const user = await this.usersService.findOne(username);
  //   if (user?.password !== password) {
  //     throw new UnauthorizedException();
  //   }

  //   const payload = { sub: user._id, username: user.username };

  //   return {
  //     access_token: await this.jwtService.signAsync(payload),
  //   };
  // }

  async register(username: string, password: string) {
    const createdUser = await this.usersService.create({
      username,
      password,
      role: 'user',
    });

    return {
      id: createdUser._id,
      username: createdUser.username,
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const { password: userPassword, ...user } =
      await this.usersService.findOne(username);

    if (userPassword !== password) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
