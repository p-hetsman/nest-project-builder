import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';

import { Role, RoleDocument } from './schemas/role.schema';
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

  async create(createRoleDto: Role): Promise<RoleDocument> {
    const createdRole = new this.roleModel(createRoleDto);

    return createdRole.save();
  }

  async findAll(): Promise<RoleDocument[]> {
    return this.roleModel.find().exec();
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
