import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Rol } from '../usuarios/usuario.entity';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Roles exigidos por el endpoint (puestos con @Roles). Si no hay, pasa.
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    // request.user lo dejó el JwtAuthGuard (que corre antes) al validar el token.
    const request = context.switchToHttp().getRequest<Request>();
    const usuario = request['user'] as { rol?: Rol } | undefined;

    if (!usuario || !rolesRequeridos.includes(usuario.rol as Rol)) {
      throw new ForbiddenException('No tenés permiso para esta acción');
    }
    return true;
  }
}
