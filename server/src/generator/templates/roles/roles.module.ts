import { Module } from '@nestjs/common';

import { RolesService } from './roles.service';
import { DatabaseModule } from '../database/database.module';
import { rolesProviders } from './roles.providers';
import { RoleCreatorController } from './roles.controller';

@Module({
  controllers: [RoleCreatorController],
  imports: [DatabaseModule],
  providers: [RolesService, ...rolesProviders],
  exports: [RolesService],
})
export class RolesModule { }
