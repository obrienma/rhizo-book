import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Allow all origins in production, will later specify frontend URL
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('RhizoBook API')
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

  const port = process.env.PORT || 3001; // ← Read from environment
  await app.listen(port, '0.0.0.0'); // ← Bind to all interfaces

  if (process.env.NODE_ENV === 'production') {
    console.log(`🚀 Backend running on port ${port}`);
    console.log(`📚 Swagger docs available at /api`);
  } else {
    console.log(`🚀 Backend running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
  }
}
bootstrap();
