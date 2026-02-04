import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/infra/primary/app/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/user (POST) - Create User', () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/user')
      .send({ name: 'Test User', email: uniqueEmail })
      .expect(201)
      .expect((res) => {
        const body = res.body as { id: string; name: string; email: string };
        expect(body.id).toBeDefined();
        expect(body.name).toBe('Test User');
        expect(body.email).toBe(uniqueEmail);
      });
  });

  it('/user (POST) - Validation Error', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/user')
      .send({ name: 'Test User' }) // Missing email
      .expect(400);
  });
});
