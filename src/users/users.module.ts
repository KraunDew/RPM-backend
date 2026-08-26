import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/userSchema';
import { usersController } from './users.controller';
import { usersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [usersController],
  providers: [usersService],
})
export class UsersModule {}
