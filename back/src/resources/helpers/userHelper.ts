import { User } from "@/models/User";
import { RolesEnum } from "../emuns/rolesEnum";

export async function addUserRole(user: User, role: RolesEnum)
{
    const rolesArray = user.Roles ? user.Roles.split(',') : [];

    if (rolesArray.includes(role))
        return;

    rolesArray.push(role);
    user.Roles = rolesArray.join(',');
    await user.save();
}

export async function removeUserRole(user: User, role: RolesEnum)
{
    const rolesArray = user.Roles ? user.Roles.split(',') : [];

    if (!rolesArray.includes(role))
        return;

    const updatedRoles = rolesArray.filter(r => r !== role);
    user.Roles = updatedRoles.join(',');
    await user.save();
}