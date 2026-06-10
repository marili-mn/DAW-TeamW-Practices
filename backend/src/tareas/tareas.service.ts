import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { EstadoTarea, Tarea } from './tarea.entity';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareasRepository: Repository<Tarea>,
    @InjectRepository(Proyecto)
    private readonly proyectosRepository: Repository<Proyecto>,
  ) {}

  async findOne(id: number): Promise<Tarea> {
    const tarea = await this.tareasRepository.findOneBy({ id });
    if (!tarea) {
      throw new NotFoundException(`Tarea ${id} no encontrada`);
    }
    return tarea;
  }

  async create(createTareaDto: CreateTareaDto): Promise<Tarea> {
    const proyecto = await this.proyectosRepository.findOneBy({
      id: createTareaDto.id_proyecto,
    });
    if (!proyecto) {
      throw new NotFoundException(
        `Proyecto ${createTareaDto.id_proyecto} no encontrado`,
      );
    }
    const tarea = this.tareasRepository.create({
      descripcion: createTareaDto.descripcion,
      estado: EstadoTarea.PENDIENTE,
      proyecto,
    });
    return this.tareasRepository.save(tarea);
  }

  async update(id: number, updateTareaDto: UpdateTareaDto): Promise<Tarea> {
    const tarea = await this.findOne(id);
    Object.assign(tarea, updateTareaDto);
    return this.tareasRepository.save(tarea);
  }

  async remove(id: number): Promise<Tarea> {
    const tarea = await this.findOne(id);
    tarea.estado = EstadoTarea.BAJA;
    return this.tareasRepository.save(tarea);
  }
}
