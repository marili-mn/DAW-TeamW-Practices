export type EstadoCliente = 'ACTIVO' | 'BAJA';
export type EstadoProyecto = 'ACTIVO' | 'FINALIZADO' | 'BAJA';
export type EstadoTarea = 'PENDIENTE' | 'FINALIZADA' | 'BAJA';

export interface Cliente {
  id: number;
  nombre: string;
  estado: EstadoCliente;
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
