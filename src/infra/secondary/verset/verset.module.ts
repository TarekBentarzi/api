import { Module } from '@nestjs/common';
import { VersetController } from './controller/verset.controller';
import { VersetService } from './service/verset.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VersetController],
  providers: [VersetService],
  exports: [VersetService],
})
export class VersetModule {}
