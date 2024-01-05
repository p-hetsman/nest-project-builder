import { Module } from '@nestjs/common';

import { RolesService } from './roles.service';
import { DatabaseModule } from '../database/database.module';
import { rolesProviders } from './roles.providers';

@Module({
  imports: [DatabaseModule],
  providers: [RolesService, ...rolesProviders],
  exports: [RolesService],
})
export class RolesModule {}
