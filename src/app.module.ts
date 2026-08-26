import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupplierModule } from './suppliers/suppliers.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/rpm'),
    UsersModule,
    SupplierModule,
  ],
})
export class AppModule {}
