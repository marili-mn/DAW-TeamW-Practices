import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EstadoUsuario, Usuario } from '../usuarios/usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const usuario = await this.usuariosRepository.findOneBy({
      nombre: loginDto.nombre,
    });

    const claveValida =
      usuario && (await bcrypt.compare(loginDto.clave, usuario.clave));

    if (!usuario || !claveValida || usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuario.id, nombre: usuario.nombre };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
