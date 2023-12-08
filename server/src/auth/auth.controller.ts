import {
  Controller,
  Post,
  Get,
  // HttpCode,
  // HttpStatus,
  UseGuards,
  Request,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @HttpCode(HttpStatus.OK)
  // @Post('login')
  // signIn(@Body() signInDto: Record<string, any>) {
  //   return this.authService.signIn(signInDto.username, signInDto.password);
  // }

  @UseGuards(AuthGuard())
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // @Post('register')
  // signUp(@Body() signUpDto: Record<string, any>) {
  //   return this.authService.register(signUpDto.username, signUpDto.password);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates the Google authentication process
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req) {
    // Handles the Google authentication callback

    const { access_token } = await this.authService.login({
      username: req.user.email,
      _id: req.user.id,
    });

    return {
      access_token,
    };
  }
}
