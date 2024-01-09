import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CaslGuard } from 'src/auth/guards/casl.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Action, CheckPolicies } from 'src/auth/policies/constants';

@Controller('test')
export class TestController {
  @Get('')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('/permission')
  @UseGuards(CaslGuard)
  @CheckPolicies(Action.Read + '_' + 'all')
  getPermission(@Request() req) {
    return {
      message: `Permission '${Action.Read}'  granted for ${req.user.username}`,
    };
  }
}
