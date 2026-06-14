import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Proyecto } from '../proyectos/proyecto.entity';
import { Tarea } from '../tareas/tarea.entity';

export interface Estadisticas {
  proyectosPorEstado: { estado: string; cantidad: number }[];
  tareasPorEstado: { estado: string; cantidad: number }[];
  topClientes: { cliente: string; proyectos: number }[];
  proyectosAtrasados: number;
  totales: {
    proyectos: number;
    proyectosActivos: number;
    clientes: number;
    clientesActivos: number;
    tareas: number;
    tareasPendientes: number;
  };
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectosRepo: Repository<Proyecto>,
    @InjectRepository(Tarea)
    private readonly tareasRepo: Repository<Tarea>,
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
  ) {}

  async obtener(): Promise<Estadisticas> {
    // groupBy con QueryBuilder: SELECT estado, COUNT(*) ... GROUP BY estado.
    const proyectosPorEstadoRaw = await this.proyectosRepo
      .createQueryBuilder('p')
      .select('p.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('p.estado')
      .getRawMany<{ estado: string; cantidad: string }>();

    const tareasPorEstadoRaw = await this.tareasRepo
      .createQueryBuilder('t')
      .select('t.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('t.estado')
      .getRawMany<{ estado: string; cantidad: string }>();

    // Top 5 clientes por cantidad de proyectos. INNER JOIN para excluir
    // proyectos internos (sin cliente).
    const topClientesRaw = await this.proyectosRepo
      .createQueryBuilder('p')
      .innerJoin('p.cliente', 'c')
      .select('c.nombre', 'cliente')
      .addSelect('COUNT(*)', 'proyectos')
      .groupBy('c.nombre')
      .orderBy('proyectos', 'DESC')
      .limit(5)
      .getRawMany<{ cliente: string; proyectos: string }>();

    const proyectosAtrasados = await this.proyectosRepo
      .createQueryBuilder('p')
      .where('p.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('p.fecha_fin IS NOT NULL')
      .andWhere('p.fecha_fin < CURRENT_DATE')
      .getCount();

    const [proyectos, clientes, tareas] = await Promise.all([
      this.proyectosRepo.count(),
      this.clientesRepo.count(),
      this.tareasRepo.count(),
    ]);
    const [proyectosActivos, clientesActivos, tareasPendientes] =
      await Promise.all([
        this.proyectosRepo.count({ where: { estado: 'ACTIVO' as never } }),
        this.clientesRepo.count({ where: { estado: 'ACTIVO' as never } }),
        this.tareasRepo.count({ where: { estado: 'PENDIENTE' as never } }),
      ]);

    return {
      proyectosPorEstado: proyectosPorEstadoRaw.map((r) => ({
        estado: r.estado,
        cantidad: Number(r.cantidad),
      })),
      tareasPorEstado: tareasPorEstadoRaw.map((r) => ({
        estado: r.estado,
        cantidad: Number(r.cantidad),
      })),
      topClientes: topClientesRaw.map((r) => ({
        cliente: r.cliente,
        proyectos: Number(r.proyectos),
      })),
      proyectosAtrasados,
      totales: {
        proyectos,
        proyectosActivos,
        clientes,
        clientesActivos,
        tareas,
        tareasPendientes,
      },
    };
  }
}
