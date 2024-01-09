import { Controller, Post, Body } from '@nestjs/common';
import { RolesService } from 'src/roles/roles.service';

@Controller('role-creator')
export class RoleCreatorController {
  constructor(private readonly roleService: RolesService) {}

  @Post()
  async createRole(
    @Body('name') name: string,
    @Body('permissions') permissions: any[],
  ) {
    try {
      const newRole = await this.roleService.create(name, permissions);
      return { success: true, role: newRole };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
