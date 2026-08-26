import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/userSchema';

@Injectable()
export class usersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  getAllUsers() {
    return this.userModel.find();
  }

  async createUser(createUserDto) {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();
    return createdUser;
  }
}
