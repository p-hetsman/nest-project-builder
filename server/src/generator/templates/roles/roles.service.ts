import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';

import { Permission, Role, RoleDocument } from './schemas/role.schema';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Action } from './roles.constants';

@Injectable()
export class RolesService {
  constructor(
    @Inject('ROLE_MODEL')
    private roleModel: Model<Role>,
  ) { }

  async findOne(name: string): Promise<RoleDocument> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findById(id: string): Promise<RoleDocument> {
    return this.roleModel.findById(id);
  }

  async create(name: string, permissions: Permission[]): Promise<RoleDocument> {
    const createdRole = new this.roleModel({ name, permissions });
    return createdRole.save();
  }

  async findAll(): Promise<RoleDocument[]> {
    return this.roleModel.find().exec();
  }
  async findAllNames(): Promise<string[]> {
    try {
      const roles = await this.roleModel.find({}, 'name').lean();
      const names = roles.map((role) => role.name);
      return names;
    } catch (error) {
      return error;
    }
  }
  async findAllPermissions(): Promise<RoleDocument[]> {
    const pipeline = [
      { $unwind: '$permissions' },
      {
        $group: {
          _id: {
            action: '$permissions.action',
            subject: '$permissions.subject',
          },
        },
      },
      {
        $project: {
          _id: 0,
          action: '$_id.action',
          subject: '$_id.subject',
        },
      },
    ];

    const result = await this.roleModel.aggregate(pipeline).exec();
    return result;
  }
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDocument> {
    return this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();
  }
  async updateWithValidation(id: string, updatedRole: Partial<Role>) {
    try {
      const existingRole = await this.findById(id);

      if (!existingRole) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }

      if (updatedRole.name) {
        existingRole.name = updatedRole.name;
      }

      if (updatedRole.permissions !== undefined) {
        this.validateAndUpdatePermissions(
          existingRole,
          updatedRole.permissions,
        );
      }

      return await existingRole.save();
    } catch (error) {
      throw new BadRequestException(`Error updating role: ${error.message}`);
    }
  }

  async remove(id: string): Promise<RoleDocument | null> {
    try {
      const removedRole = (await this.roleModel
        .findByIdAndDelete(id)
        .exec()) as unknown as RoleDocument | null;
      return removedRole || null;
    } catch (error) {
      return null;
    }
  }
  /**
   * Validates an object.
   *
   * @param {Partial<Role>} obj - The object to validate.
   * @returns {boolean} Returns true if the object is valid, false otherwise.
   */
  private validateObject(obj: Partial<Role>): boolean {
    const validActions = Object.values(Action);

    for (const permission of obj.permissions) {
      if (!validActions.includes(permission.action)) {
        return false;
      }
    }

    return true;
  }
  /**
   * Validates and updates the permissions of an existing role.
   *
   * @param {Role} existingRole - The existing role to update.
   * @param {PermissionS[]} permissions - The new permissions to assign to the role.
   * @throws {BadRequestException} If permissions is not an array or if it is empty.
   * @throws {BadRequestException} If the updatedRole has invalid permissions.
   */
  private validateAndUpdatePermissions(
    existingRole: Role,
    permissions: Permission[],
  ) {
    if (!Array.isArray(permissions)) {
      throw new BadRequestException(`Permissions should be an array.`);
    }

    if (permissions.length === 0) {
      throw new BadRequestException(`Permissions array should not be empty.`);
    }

    const updatedRole: Partial<Role> = {
      name: existingRole.name,
      permissions: permissions,
    };

    if (!this.validateObject(updatedRole)) {
      throw new BadRequestException(`Invalid permissions in the updatedRole.`);
    }

    existingRole.permissions = permissions;
  }
}
