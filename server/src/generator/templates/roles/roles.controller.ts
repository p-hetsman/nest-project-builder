import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RoleCreatorController {
  constructor(private readonly roleService: RolesService) { }

  @Post()
  /**
   * Creates a new role with the given name and permissions.
   *
   * @param {string} name - The name of the role.
   * @param {any[]} permissions - An array of permissions for the role.
   * @return {object} An object containing the success status and the created role.
   */
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
  /**
   * Retrieves all roles.
   *
   * @return {Promise<{ success: boolean, roles: type }>} Object containing success status and roles
   */
  async getRoles() {
    try {
      const roles = await this.roleService.findAllNames();
      return { success: true, roles: roles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  @Get('permissions')
  /**
   * Retrieves the roles and their associated permissions.
   *
   * @return {Promise<{ success: boolean, roles: Role[] }>} A promise that resolves to an object containing the roles and their associated permissions.
   */
  async getRolesPermissions() {
    try {
      const roles = await this.roleService.findAllPermissions();
      return { success: true, roles: roles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete(':id')
  /**
   * Deletes a role.
   *
   * @param {string} id - The ID of the role to delete.
   * @return {Promise<{ message: string; deletedRole?: any; }>} - An object containing a message and, if successful, the deleted role.
   */
  async deleteRole(@Param('id') id: string) {
    try {
      const deletedRole = await this.roleService.remove(id);

      if (!deletedRole) {
        return { message: 'Role not found or already deleted' };
      }

      return { message: 'Role deleted successfully', deletedRole };
    } catch (error) {
      return { message: 'Failed to delete role' };
    }
  }
}
