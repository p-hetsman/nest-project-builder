import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async findOne(username: string) {
    return (await this.userModel.findOne({ username })).toObject();
  }

  async create(createUserDto: User) {
    const createdUser = new this.userModel(createUserDto);

    return createdUser.save();
  }

  async findAll() {
    return this.userModel.find();
  }
}
