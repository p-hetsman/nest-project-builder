import { createMongoAbility, AbilityBuilder } from '@casl/ability';
import { UserPolicyDto } from 'src/auth/policies/policies-user.dto';

export const defineAbilitiesFor = (
  user: UserPolicyDto,
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
