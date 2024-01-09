import { Permission } from '../schemas/role.schema';

export class UpdateRoleDto {
  name?: string;
  permissions?: Permission[];
}
