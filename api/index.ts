import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/infra/primary/app/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as express from 'express';

const server = express();

export let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn', 'log'] }
    );
    
    app.enableCors({
      origin: [
        'http://localhost:8081',
        'http://localhost:19006',
        'https://app-ui-lemon.vercel.app',
        /^https:\/\/.*\.vercel\.app$/,
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization,Accept',
    });
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    
    await app.init();
  }
  return app;
}

export default async (req: any, res: any) => {
  await createApp();
  return server(req, res);
};
