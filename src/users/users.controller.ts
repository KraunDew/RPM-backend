import { Body, Controller, Get, Post } from '@nestjs/common';
import { usersService } from './users.service';

@Controller()
export class usersController {
  constructor(private usersService: usersService) {}

  @Get('/users')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Post('/users')
  createUser(@Body() createUser) {
    return this.usersService.createUser(createUser);
  }
}
