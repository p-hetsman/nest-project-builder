import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

const PORT = 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'verbose', 'log', 'warn', 'error'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(
    session({
      secret: '< secret >',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    credentials: true,
  });

  await app.listen(PORT);
  Logger.log(`Server listening at ${PORT}`, 'main');
}

bootstrap();
