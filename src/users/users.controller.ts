import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { usersService } from './users.service';

@Controller()
export class usersController {
  constructor(private usersService: usersService) {}

  @Post('/users')
  getAllUsers(@Body() createUser: CreateUserDto): CreateUserDto {
    return this.usersService.createUser(createUser);
  }
}
