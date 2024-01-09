import { Module } from '@nestjs/common';
import { RoleCreatorController } from './role-creator.controller';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [RolesModule],
  controllers: [RoleCreatorController],
  providers: [],
})
export class RoleCreatorModule {}
