import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { RolesService } from 'src/roles/roles.service';
import { Permission, Role } from './schemas/role.schema';

@Controller('roles')
export class RoleCreatorController {
  constructor(private readonly roleService: RolesService) { }

  @Get('name/:name')
  /**
   * Finds the role name.
   *
   * @param {string} name - The name of the role.
   * @return {Promise<{ message: string; role?: Role; }>} The message and role object, if found.
   */
  async findRoleName(@Param('name') name: string) {
    try {
      const role = await this.roleService.findOne(name);
      if (!role) {
        return { message: 'Role not found' };
      }
      return { message: 'Role found successfully', role };
    } catch (error) {
      return { message: 'Failed to find role' };
    }
  }

  @Get('id/:id')
  /**
   * Find the role ID.
   *
   * @param {string} roleId - The ID of the role.
   * @return {Promise<{ message: string, role?: Role }>} - An object containing a message and optionally a role.
   */
  async findRoleID(@Param('id') roleId: string) {
    const role = await this.roleService.findById(roleId);
    if (role) {
      return { message: 'Role found successfully', role };
    } else {
      return { message: 'Role not found' };
    }
  }

  @Post()
  /**
   * Creates a new role with the given name and permissions.
   *
   * @param {string} name - The name of the role.
   * @param {Permission[]} permissions - An array of permissions for the role.
   * @return {object} An object containing the success status and the created role.
   */
  async createRole(
    @Body('name') name: string,
    @Body('permissions') permissions: Permission[],
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
   * @return {Promise<{ success: boolean, roles: Role[] }>} An object with a success flag and an array of roles.
   */
  async getRolesAll() {
    try {
      const roles = await this.roleService.findAll();
      return { success: true, roles: roles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('names')
  /**
   * Retrieves all roles.
   *
   * @return {Promise<{ success: boolean, roles: type }>} Object containing success status and roles
   */
  async getRolesNames() {
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
      return { success: true, roles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Put(':id')
  /**
   * Updates a role in the system.
   *
   * @param {string} id - The ID of the role to update.
   * @param {Partial<Role>} updatedRole - The updated role data.
   * @return {Promise<Role>} The updated role.
   */
  async updateRole(
    @Param('id') id: string,
    @Body() updatedRole: Partial<Role>,
  ): Promise<Role> {
    return await this.roleService.updateWithValidation(id, updatedRole);
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
