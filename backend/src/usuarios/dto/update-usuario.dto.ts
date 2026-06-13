import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { EstadoUsuario } from '../usuario.entity';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'julieta' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional({ example: 'nuevaClave123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  clave?: string;

  @ApiPropertyOptional({ enum: EstadoUsuario })
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;
}