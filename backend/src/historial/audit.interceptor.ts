import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { HistorialService } from './historial.service';

// Método HTTP -> acción registrada
const ACCIONES: Record<string, string> = {
  POST: 'ALTA',
  PATCH: 'MODIFICACION',
  PUT: 'MODIFICACION',
  DELETE: 'BAJA',
};

// Primer segmento de la URL -> nombre de entidad (solo estas se auditan)
const ENTIDADES: Record<string, string> = {
  proyectos: 'proyecto',
  clientes: 'cliente',
  tareas: 'tarea',
  usuarios: 'usuario',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly historial: HistorialService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const accion = ACCIONES[req.method];

    // tap() corre DESPUÉS de que el handler respondió con éxito, así que solo
    // registramos cambios que efectivamente se hicieron.
    return next.handle().pipe(
      tap((data) => {
        if (!accion) return; // no es una mutación (GET, etc.)

        const usuario = (req['user'] as { nombre?: string } | undefined)
          ?.nombre;
        if (!usuario) return; // sin usuario autenticado (ej: login) no registramos

        const recurso = this.recursoDesde(req.path);
        const entidad = ENTIDADES[recurso];
        if (!entidad) return; // entidad que no auditamos

        // El id sale del parámetro de ruta (PATCH/DELETE) o del objeto creado (POST).
        const idParam = Number(req.params?.['id']);
        const idDato =
          data && typeof data === 'object' && 'id' in data
            ? (data as { id?: number }).id
            : undefined;

        void this.historial.registrar({
          entidad,
          entidadId: Number.isFinite(idParam) ? idParam : (idDato ?? null),
          accion,
          usuario,
        });
      }),
    );
  }

  // '/api/proyectos/5' -> 'proyectos'
  private recursoDesde(path: string): string {
    const partes = path.split('/').filter(Boolean);
    const i = partes.indexOf('api');
    return i >= 0 ? (partes[i + 1] ?? '') : (partes[0] ?? '');
  }
}
