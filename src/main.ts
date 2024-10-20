import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Basic Swagger configuration
  const config = new DocumentBuilder()
      .setTitle('Authentication API')  // Title of the API documentation
      .setDescription('API documentation for JWT authentication and role-based access control')  // Description of the API
      .setVersion('1.0')  // Version of the API
      .addBearerAuth()  // Adds Bearer authentication for JWT
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);  // Sets the path for Swagger documentation

  await app.listen(3000);  // Starts the application
}

bootstrap();
