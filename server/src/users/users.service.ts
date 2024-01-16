import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';

import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) { }

  async findOne(username: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ username })
      .populate({
        path: 'role',
        select: { permissions: { _id: 0 }, _id: 0 },
      })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).populate('role').select('-_id').exec();
  }
  async create(createUserDto: User): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);

    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    try {
      const removedRole = (await this.userModel
        .findByIdAndDelete(id)
        .exec()) as unknown as UserDocument | null;
      return removedRole || null;
    } catch (error) {
      return null;
    }
  }
}
