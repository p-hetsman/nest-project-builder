import { Module } from '@nestjs/common';

import { databaseProviders } from '../common/providers/database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
