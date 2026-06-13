export type EstadoCliente = 'ACTIVO' | 'BAJA';
export type EstadoProyecto = 'ACTIVO' | 'FINALIZADO' | 'BAJA';
export type EstadoTarea = 'PENDIENTE' | 'FINALIZADA' | 'BAJA';
export type EstadoUsuario = 'ACTIVO' | 'BAJA';

export interface Cliente {
  id: number;
  nombre: string;
  estado: EstadoCliente;
  telefono?: string | null;
  email?: string | null;
}

export interface Tarea {
  id: number;
  descripcion: string;
  estado: EstadoTarea;
}

export interface Proyecto {
  id: number;
  nombre: string;
  estado: EstadoProyecto;
  cliente: Cliente | null;
  tareas?: Tarea[];
}

export interface Historial {
  id: number;
  entidad: string;
  entidadId: number | null;
  accion: string;
  usuario: string;
  fecha: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  estado: EstadoUsuario;
}
