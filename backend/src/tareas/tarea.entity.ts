import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';

export enum EstadoTarea {
  PENDIENTE = 'PENDIENTE',
  FINALIZADA = 'FINALIZADA',
  BAJA = 'BAJA',
}

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'enum', enum: EstadoTarea, enumName: 'estados_tareas' })
  estado: EstadoTarea;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.tareas, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;
}
