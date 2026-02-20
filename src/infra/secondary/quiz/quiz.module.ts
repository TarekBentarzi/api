import { Module } from '@nestjs/common';
import { QuizController, MemorizationController } from './controller/quiz.controller';
import { QuizService } from './service/quiz.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController, MemorizationController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
