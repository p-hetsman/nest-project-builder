import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { LogRequestMiddleware } from './common/middlewares/log-request.middleware';

import { GeneratorModule } from './generator/generator.module';
import { TestController } from './test-route/test.controller';

@Module({
  imports: [AuthModule, UsersModule, DatabaseModule, GeneratorModule],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
    consumer.apply(LogRequestMiddleware).forRoutes('*');
  }
}
