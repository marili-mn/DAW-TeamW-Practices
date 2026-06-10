import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Tarea } from '../tareas/tarea.entity';

export enum EstadoProyecto {
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
  BAJA = 'BAJA',
}

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ type: 'enum', enum: EstadoProyecto, enumName: 'estados_proyectos' })
  estado: EstadoProyecto;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente | null;

  @OneToMany(() => Tarea, (tarea) => tarea.proyecto)
  tareas: Tarea[];
}
