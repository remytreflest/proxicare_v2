import { RolesEnum } from "@/resources/emuns/rolesEnum";

export function joinRoles(roles: RolesEnum[]): string {
  return roles.join(',');
}