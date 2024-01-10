import { Controller, Post, Body, Get } from '@nestjs/common';
import { RolesService } from 'src/roles/roles.service';

@Controller('roles')
export class RoleCreatorController {
  constructor(private readonly roleService: RolesService) { }

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
  @Get()
  async getRoles() {
    try {
      const roles = await this.roleService.findAllNames();
      return { success: true, roles: roles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  @Get('permissions')
  async getRolesPermissions() {
    try {
      const roles = await this.roleService.findAllPermissions();
      return { success: true, roles: roles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
