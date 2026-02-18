import { Module } from '@nestjs/common';
import { UserSaveController } from './controller/user-save.controller';
import { UserSaveService } from './service/user-save.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserSaveController],
  providers: [UserSaveService],
  exports: [UserSaveService],
})
export class UserSaveModule {}
