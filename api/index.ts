import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/infra/primary/app/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import express, { Request, Response } from 'express';

const expressApp = express();
let cachedApp: any;

async function bootstrapServer() {
  if (!cachedApp) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { 
        logger: ['error', 'warn', 'log'],
        abortOnError: false
      }
    );
    
    nestApp.enableCors({
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
    
    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    nestApp.useGlobalInterceptors(new ClassSerializerInterceptor(nestApp.get(Reflector)));
    
    await nestApp.init();
    cachedApp = nestApp.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

export default async (req: Request, res: Response) => {
  try {
    const app = await bootstrapServer();
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
