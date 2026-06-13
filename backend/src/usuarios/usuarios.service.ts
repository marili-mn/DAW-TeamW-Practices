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

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existe = await this.usuariosRepository.findOneBy({ nombre: dto.nombre });
    if (existe) throw new ConflictException('Ya existe un usuario con ese nombre');
    const clave = await bcrypt.hash(dto.clave, 10);
    const usuario = this.usuariosRepository.create({
      nombre: dto.nombre,
      clave,
      estado: EstadoUsuario.ACTIVO,
    });
    return this.usuariosRepository.save(usuario);
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    if (dto.nombre) usuario.nombre = dto.nombre;
    if (dto.clave) usuario.clave = await bcrypt.hash(dto.clave, 10);
    if (dto.estado) usuario.estado = dto.estado;
    return this.usuariosRepository.save(usuario);
  }
}