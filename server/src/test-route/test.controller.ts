import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CaslGuard } from 'src/auth/guards/casl.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Action, CheckPolicies } from 'src/auth/policies/constants';

const testAction = Action.Read;
const testPolicy = 'all';
const testPermission = `${testAction}_${testPolicy}`;

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
  @CheckPolicies(testPermission)
  getPermission(@Request() req) {
    return {
      message: `Permission '${testAction}' with subject '${testPolicy}' granted for ${req.user.username}`,
    };
  }
}
