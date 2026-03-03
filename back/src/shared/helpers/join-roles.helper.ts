import { RolesEnum } from '@/shared/enums/roles.enum';

export function joinRoles(roles: RolesEnum[]): string {
  return roles.join(',');
}
