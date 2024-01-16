import { createMongoAbility, AbilityBuilder } from '@casl/ability';
import { UserDocument } from 'src/users/schemas/user.schema';

export const defineAbilitiesFor = (
  user: UserDocument,
  { action, resource }: { action: string; resource: string },
) => {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  if (user.role && user.role.permissions && user.role.permissions.length > 0) {
    user.role.permissions.forEach((permission) => {
      if (permission.action === action && permission.subject === resource) {
        can(action, resource);
      }
    });
    return build();
  }
};
