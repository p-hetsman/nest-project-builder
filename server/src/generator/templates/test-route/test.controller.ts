import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('test')
export class TestController {
  @Get('')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
