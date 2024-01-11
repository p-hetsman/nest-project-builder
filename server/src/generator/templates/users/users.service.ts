import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';

import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import * as mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) { }

  async findOne(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).populate('role').exec();
  }
  async findByIdWithRoleDetails(id: string) {
    const userId = new mongoose.Types.ObjectId(id);
    const pipeline = [
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roles',
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          password: 1,
          refreshToken: 1,
          role: {
            $arrayElemAt: ['$roles', 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          'role.name': 1,
          'role.permissions': 1,
        },
      },
      {
        $limit: 1,
      },
    ];

    return this.userModel.aggregate(pipeline).exec();
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
