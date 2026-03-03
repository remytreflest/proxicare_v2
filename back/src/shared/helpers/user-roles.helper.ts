import { User } from '@/infrastructure/database/models/User.model';
import { RolesEnum } from '@/shared/enums/roles.enum';

export async function addUserRole(user: User, role: RolesEnum): Promise<void> {
  const rolesArray = user.Roles ? user.Roles.split(',') : [];

  if (rolesArray.includes(role)) return;

  rolesArray.push(role);
  user.Roles = rolesArray.join(',');
  await user.save();
}

export async function removeUserRole(user: User, role: RolesEnum): Promise<void> {
  const rolesArray = user.Roles ? user.Roles.split(',') : [];

  if (!rolesArray.includes(role)) return;

  const updatedRoles = rolesArray.filter(r => r !== role);
  user.Roles = updatedRoles.join(',');
  await user.save();
}
