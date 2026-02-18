import { Module } from '@nestjs/common';
import { UserMemorizationController } from './controller/user-memorization.controller';
import { UserMemorizationService } from './service/user-memorization.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserMemorizationController],
  providers: [UserMemorizationService],
  exports: [UserMemorizationService],
})
export class UserMemorizationModule {}
