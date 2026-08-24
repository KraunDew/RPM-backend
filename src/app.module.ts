import { Module } from '@nestjs/common';
import { usersModule } from './users/users.module';
@Module({
  imports: [usersModule],
})
export class AppModule {}
