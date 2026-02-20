import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { UserModule } from '../../secondary/user/user.module';
import { AuthModule } from '../auth/auth.module';
import { SourateModule } from '../../secondary/sourate/sourate.module';
import { VersetModule } from '../../secondary/verset/verset.module';
import { UserSaveModule } from '../../secondary/user-save/user-save.module';
import { UserMemorizationModule } from '../../secondary/user-memorization/user-memorization.module';
import { QuizModule } from '../../secondary/quiz/quiz.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    SourateModule,
    VersetModule,
    UserSaveModule,
    UserMemorizationModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
