import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoCliente {
  ACTIVO = 'ACTIVO',
  BAJA = 'BAJA',
}

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ type: 'enum', enum: EstadoCliente, enumName: 'estados_clientes' })
  estado: EstadoCliente;
}
