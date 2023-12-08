import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { LogRequestMiddleware } from './common/middlewares/log-request.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { GeneratorModule } from './generator/generator.module';

@Module({
  imports: [AuthModule, UsersModule, DatabaseModule, GeneratorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
    consumer.apply(LogRequestMiddleware).forRoutes('*');
  }
}
