import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config({ path: '.env' });

// Add debug log right after loading env vars
console.log('😎 JWT_SECRET loaded:', process.env.JWT_SECRET);
console.log('😎 Environment file path:', '.env');
console.log('😎 Current working directory:', process.cwd());

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://${host}:${port}',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Health Appointment Scheduler API')
    .setDescription('API for managing healthcare appointments')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer', // ← This name must match @ApiBearerAuth() decorators
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = 3001;
  const host = process.env.HOST || 'localhost';
  await app.listen(port);
  console.log(`🚀 Backend running on http://${host}:${port}`);
  console.log(`📚 Swagger docs available at http://${host}:${port}/api`);
}
bootstrap();