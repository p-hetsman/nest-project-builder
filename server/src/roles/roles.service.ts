import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';

import { Permission, Role, RoleDocument } from './schemas/role.schema';
import { UpdateRoleDto } from './dto/update-role.dto';

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

  async remove(id: string): Promise<RoleDocument> {
    return (await this.roleModel.findByIdAndDelete(id).exec()).value;
  }
}
