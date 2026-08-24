import { Injectable } from '@nestjs/common';

@Injectable()
export class usersService {
  getUsers() {
    return ['Pene', 'si'];
  }
}
