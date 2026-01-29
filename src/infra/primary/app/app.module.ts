import { Module } from '@nestjs/common';
import { AppController } from './infra/app/app.controller';
import { AppService } from './service/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
