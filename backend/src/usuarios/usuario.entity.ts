import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  BAJA = 'BAJA',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({ type: 'enum', enum: EstadoUsuario, enumName: 'estados_usuarios' })
  estado: EstadoUsuario;
}
