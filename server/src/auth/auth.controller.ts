import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Req,
  Body,
} from '@nestjs/common';

import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { OpenidAuthGuard } from './guards/openid-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.username, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto.username, registerDto.password);

    return this.authService.login(registerDto.username, registerDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // Initiates the Google authentication process
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req) {
    // Handles the Google authentication callback
    return this.authService.generateToken(req.user);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin() {
    // Initiates the Facebook authentication process
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginCallback(@Req() req) {
    // Handles the Facebook authentication callback

    return this.authService.generateToken(req.user);
  }

  @Get('openid')
  @UseGuards(OpenidAuthGuard)
  async openidLogin() {}

  @Get('openid/callback')
  @UseGuards(OpenidAuthGuard)
  async openidLoginCallback(@Req() req) {
    // Handles the Auth0 authentication callback

    return this.authService.generateToken(req.user);
  }
}
