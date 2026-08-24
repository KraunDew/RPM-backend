import { Controller, Get } from '@nestjs/common';
import { usersService } from './users.service';

@Controller()
export class usersController {
  constructor(private usersService: usersService) {}

  @Get('/users')
  getAllUsers() {
    return this.usersService.getUsers();
  }
}
