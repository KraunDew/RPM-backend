import { Module } from '@nestjs/common';
import { usersController } from './users.controller';
import { usersService } from './users.service';

@Module({
  controllers: [usersController],
  providers: [usersService],
})
export class usersModule {}
