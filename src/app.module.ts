import { Module } from '@nestjs/common';
import { SupplierModule } from './suppliers/suppliers.module';
import { usersModule } from './users/users.module';
@Module({
  imports: [usersModule, SupplierModule],
})
export class AppModule {}
