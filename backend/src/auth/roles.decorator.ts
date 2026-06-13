import { SetMetadata } from '@nestjs/common';
import { Rol } from '../usuarios/usuario.entity';

export const ROLES_KEY = 'roles';

// Marca un endpoint con los roles habilitados. Ej: @Roles(Rol.ADMIN)
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
