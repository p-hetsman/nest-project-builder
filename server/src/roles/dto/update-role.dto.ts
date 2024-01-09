export class UpdateRoleDto {
  name?: string;
  permissions?: Permission[];
}

export class Permission {
  action: string;
  subject: string;
}
