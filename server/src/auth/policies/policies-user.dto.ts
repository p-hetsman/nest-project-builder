import { UpdateRoleDto } from 'src/roles/dto/update-role.dto';

export interface UserPolicyDto {
  _id: string;
  username: string;
  role: UpdateRoleDto;
}
