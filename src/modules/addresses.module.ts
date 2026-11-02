import { Module } from '@nestjs/common';
import { AddressesController } from 'src/controllers/addresses.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AddressesService } from 'src/services/addresses.service';

@Module({
  imports: [PrismaModule],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
