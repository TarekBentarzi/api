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
        return request(app.getHttpServer())
            .post('/user')
            .send({ name: 'Test User', email: uniqueEmail })
            .expect(201)
            .expect((res) => {
                expect(res.body.id).toBeDefined();
                expect(res.body.name).toBe('Test User');
                expect(res.body.email).toBe(uniqueEmail);
            });
    });

    it('/user (POST) - Validation Error', () => {
        return request(app.getHttpServer())
            .post('/user')
            .send({ name: 'Test User' }) // Missing email
            .expect(400);
    });
});
