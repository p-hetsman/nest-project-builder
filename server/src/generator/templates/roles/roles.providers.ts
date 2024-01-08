import { Connection } from 'mongoose';
import { RoleSchema } from './schemas/role.schema';

export const rolesProviders = [
  {
    provide: 'ROLE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Role', RoleSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
