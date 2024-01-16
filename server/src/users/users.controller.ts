import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Get('name/:name')
  async findUserName(@Param('name') name: string) {
    try {
      const user = await this.userService.findOne(name);
      const { username, role } = user;
      if (!user) {
        return { message: 'User not found' };
      }
      return { message: 'User found successfully', username, role };
    } catch (error) {
      return { message: 'Failed to find user' };
    }
  }

  @Get('id/:id')
  async findUserId(@Param('id') id: string) {
    try {
      const user = await this.userService.findById(id);

      if (!user) {
        return { message: 'User not found' };
      }
      return { message: 'User found successfully', user };
    } catch (error) {
      return { message: 'Failed to find user' };
    }
  }

  @Get()
  async findAll() {
    try {
      const users = await this.userService.findAll();
      return { message: 'Users found successfully', users };
    } catch (error) {
      return { message: 'Failed to find users' };
    }
  }
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.updateUser(id, updateUserDto);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      const deletedUser = await this.userService.remove(id);
      if (!deletedUser) {
        throw new NotFoundException('User not found or already deleted');
      }
      return { message: 'User deleted successfully', deletedUser };
    } catch (error) {
      return { message: 'Failed to delete user' };
    }
  }
}
