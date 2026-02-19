import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './infra/primary/app/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:8081',
      'http://localhost:8082',
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
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(
    `[API] Server is listening on http://0.0.0.0:${process.env.PORT ?? 3000}`,
  );
}
void bootstrap();
