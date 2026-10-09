import { Module } from '@nestjs/common';
import { IAController } from 'src/controllers/ia.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IAService } from 'src/services/ia.service';

@Module({
  imports: [PrismaModule],
  controllers: [IAController],
  providers: [IAService],
  exports: [IAService],
})
export class IAModule {}
