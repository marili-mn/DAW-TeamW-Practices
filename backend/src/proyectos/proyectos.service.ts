import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente, EstadoCliente } from '../clientes/cliente.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { EstadoProyecto, Proyecto } from './proyecto.entity';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectosRepository: Repository<Proyecto>,
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
  ) {}

  findAll(): Promise<Proyecto[]> {
    return this.proyectosRepository.find({
      relations: { cliente: true },
      order: { nombre: 'ASC' },
    });
  }

  // Búsqueda avanzada con filtros, ordenamiento y paginación.
  // Devuelve el shape estándar {data, total, page, pageSize}.
  async search(opts: {
    nombre?: string;
    estado?: EstadoProyecto;
    clienteId?: number;
    sort?: string;
    dir?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: Proyecto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const qb = this.proyectosRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.cliente', 'cliente');

    if (opts.nombre) {
      qb.andWhere('p.nombre ILIKE :nombre', { nombre: `%${opts.nombre}%` });
    }
    if (opts.estado) {
      qb.andWhere('p.estado = :estado', { estado: opts.estado });
    }
    if (opts.clienteId !== undefined && opts.clienteId !== null) {
      qb.andWhere('cliente.id = :cid', { cid: opts.clienteId });
    }

    // Whitelist de columnas ordenables para evitar SQL injection vía sort.
    const camposOrdenables: Record<string, string> = {
      nombre: 'p.nombre',
      estado: 'p.estado',
      fecha_fin: 'p.fecha_fin',
      id: 'p.id',
    };
    const sortField = camposOrdenables[opts.sort ?? ''] ?? 'p.nombre';
    const dir = opts.dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(sortField, dir);

    const page = Math.max(1, Number(opts.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(opts.pageSize) || 10));
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pageSize };
  }

  async findOne(id: number): Promise<Proyecto> {
    const proyecto = await this.proyectosRepository.findOne({
      where: { id },
      relations: { cliente: true, tareas: true },
      order: { tareas: { id: 'ASC' } },
    });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto ${id} no encontrado`);
    }
    return proyecto;
  }

  async create(createProyectoDto: CreateProyectoDto): Promise<Proyecto> {
    const cliente = await this.resolverCliente(createProyectoDto.id_cliente);
    const proyecto = this.proyectosRepository.create({
      nombre: createProyectoDto.nombre,
      estado: EstadoProyecto.ACTIVO,
      fechaFin: createProyectoDto.fecha_fin ?? null,
      cliente,
    });
    const guardado = await this.proyectosRepository.save(proyecto);
    return this.findOne(guardado.id);
  }

  async update(
    id: number,
    updateProyectoDto: UpdateProyectoDto,
  ): Promise<Proyecto> {
    const proyecto = await this.findOne(id);

    if (updateProyectoDto.nombre !== undefined) {
      proyecto.nombre = updateProyectoDto.nombre;
    }
    if (updateProyectoDto.estado !== undefined) {
      proyecto.estado = updateProyectoDto.estado;
    }
    if (updateProyectoDto.id_cliente !== undefined) {
      proyecto.cliente = await this.resolverCliente(
        updateProyectoDto.id_cliente,
      );
    }
    if (updateProyectoDto.fecha_fin !== undefined) {
      proyecto.fechaFin = updateProyectoDto.fecha_fin;
    }

    await this.proyectosRepository.save(proyecto);
    return this.findOne(id);
  }

  private async resolverCliente(
    idCliente: number | null | undefined,
  ): Promise<Cliente | null> {
    if (idCliente === undefined || idCliente === null) {
      return null;
    }
    const cliente = await this.clientesRepository.findOneBy({ id: idCliente });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${idCliente} no encontrado`);
    }
    if (cliente.estado !== EstadoCliente.ACTIVO) {
      throw new BadRequestException(
        'Solo se puede asignar un cliente en estado ACTIVO',
      );
    }
    return cliente;
  }
}
