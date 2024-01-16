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

  /**
   * Retrieves a single user document based on the provided username.
   *
   * @param {string} username - The username of the user to find.
   * @return {Promise<UserDocument>} A promise that resolves to the found user document.
   */
  async findOne(username: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ username })
      .populate({
        path: 'role',
        select: { permissions: { _id: 0 }, _id: 0 },
      })
      .exec();
  }

  /**
   * Finds a user document by its ID and returns it.
   *
   * @param {string} id - The ID of the user document.
   * @return {Promise<UserDocument>} A promise that resolves with the user document.
   */
  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).populate('role').select('-_id').exec();
  }
  async create(createUserDto: User): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);

    return createdUser.save();
  }

  /**
   * Find all user documents.
   *
   * @return {Promise<UserDocument[]>} All user documents.
   */
  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .populate('role')
      .select('-password -refreshToken -_id -__v')
      .exec();
  }

  /**
   * Updates a user.
   *
   * @param {string} id - The id of the user to update.
   * @param {UpdateUserDto} updateUserDto - The data to update the user with.
   * @return {Promise<UserDocument | null>} The updated user or null if not found.
   */
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .populate('role')
      .select('-password -refreshToken -_id -__v');

    return updatedUser;
  }
  /**
   * Updates a user document in the database.
   *
   * @param {string} id - The ID of the user document to update.
   * @param {UpdateUserDto} updateUserDto - The data to update the user document with.
   * @return {Promise<UserDocument>} - A promise that resolves to the updated user document.
   */
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
        .populate('role')
        .select('-password -refreshToken -_id -__v')
        .exec()) as unknown as UserDocument | null;
      return removedRole || null;
    } catch (error) {
      return null;
    }
  }
}
