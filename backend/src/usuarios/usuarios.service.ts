import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EstadoUsuario, Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  /** Fetch interno con clave incluida — solo para operaciones que la necesiten. */
  private async _findConClave(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      select: { id: true, nombre: true, clave: true, estado: true, rol: true },
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existe = await this.usuariosRepository.findOneBy({ nombre: dto.nombre });
    if (existe) throw new ConflictException('Ya existe un usuario con ese nombre');
    const clave = await bcrypt.hash(dto.clave, 10);
    const usuario = this.usuariosRepository.create({
      nombre: dto.nombre,
      clave,
      estado: EstadoUsuario.ACTIVO,
    });
    await this.usuariosRepository.save(usuario);
    return this.findOne(usuario.id);
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this._findConClave(id);
    if (dto.nombre) usuario.nombre = dto.nombre;
    if (dto.clave) usuario.clave = await bcrypt.hash(dto.clave, 10);
    if (dto.estado) usuario.estado = dto.estado;
    await this.usuariosRepository.save(usuario);
    return this.findOne(id);
  }
}