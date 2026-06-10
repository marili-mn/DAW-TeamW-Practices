import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';
import { Cliente, EstadoCliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Proyecto)
    private readonly proyectosRepository: Repository<Proyecto>,
  ) {}

  findAll(estado?: EstadoCliente): Promise<Cliente[]> {
    return this.clientesRepository.find({
      where: estado ? { estado } : {},
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOneBy({ id });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${id} no encontrado`);
    }
    return cliente;
  }

  create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const cliente = this.clientesRepository.create({
      nombre: createClienteDto.nombre,
      estado: EstadoCliente.ACTIVO,
    });
    return this.clientesRepository.save(cliente);
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (
      updateClienteDto.estado === EstadoCliente.BAJA &&
      cliente.estado !== EstadoCliente.BAJA
    ) {
      const proyectosAsociados = await this.proyectosRepository.count({
        where: { cliente: { id } },
      });
      if (proyectosAsociados > 0) {
        throw new ConflictException(
          'No se puede dar de baja un cliente registrado en proyectos',
        );
      }
    }

    Object.assign(cliente, updateClienteDto);
    return this.clientesRepository.save(cliente);
  }
}
