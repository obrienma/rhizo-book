import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Lightweight e2e suite that exercises the public (non-authed) endpoints.
 * Auth-protected endpoints need a real or seeded database – those are
 * better covered by integration tests or a dedicated test-DB setup.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $on: jest.fn(),
        onModuleInit: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) should return API running message', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('💊 Health Scheduler API is running');
  });

  it('/health (GET) should return health check', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .then((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('Health Scheduler API');
        expect(res.body.timestamp).toBeDefined();
      });
  });
});
