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
