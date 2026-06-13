import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('historial')
export class Historial {
  @PrimaryGeneratedColumn()
  id: number;

  // Qué entidad cambió: 'proyecto' | 'cliente' | 'tarea'
  @Column({ type: 'text' })
  entidad: string;

  // Id del registro afectado (puede faltar en algún caso)
  @Column({ name: 'entidad_id', type: 'int', nullable: true })
  entidadId: number | null;

  // Acción: 'ALTA' | 'MODIFICACION' | 'BAJA'
  @Column({ type: 'text' })
  accion: string;

  // Nombre del usuario que hizo el cambio
  @Column({ type: 'text' })
  usuario: string;

  @CreateDateColumn({ name: 'fecha', type: 'timestamptz' })
  fecha: Date;
}
