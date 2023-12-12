import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const PORT = 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'verbose', 'log', 'warn', 'error'],
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter());

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    credentials: true,
  };
  app.enableCors(corsOptions);

  await app.listen(PORT);
  Logger.log(`Server listening at ${PORT}`, 'main');
}

bootstrap();
