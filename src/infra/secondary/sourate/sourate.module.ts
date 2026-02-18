import { Module } from '@nestjs/common';
import { SourateController } from './controller/sourate.controller';
import { SourateService } from './service/sourate.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SourateController],
  providers: [SourateService],
  exports: [SourateService],
})
export class SourateModule {}
