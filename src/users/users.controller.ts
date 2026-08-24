import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { usersService } from './users.service';

@Controller()
export class usersController {
  constructor(private usersService: usersService) {}

  @Post('/users')
  @UsePipes(new ValidationPipe())
  getAllUsers(@Body() createUser: CreateUserDto): CreateUserDto {
    return this.usersService.createUser(createUser);
  }
}
