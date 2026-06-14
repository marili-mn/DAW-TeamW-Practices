import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '../usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'julieta' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'miClave123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  clave: string;

  @ApiPropertyOptional({ enum: Rol, default: Rol.ESTANDAR })
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}