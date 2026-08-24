import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class usersService {
  createUser(createUserDto: CreateUserDto): CreateUserDto {
    console.log('Creating user:', createUserDto);
    return createUserDto;
  }
}
