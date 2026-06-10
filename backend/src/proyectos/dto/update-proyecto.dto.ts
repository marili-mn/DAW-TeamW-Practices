import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EstadoProyecto } from '../proyecto.entity';

export class UpdateProyectoDto {
  @ApiPropertyOptional({ example: 'Sistema de gestión' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional({ enum: EstadoProyecto })
  @IsOptional()
  @IsEnum(EstadoProyecto)
  estado?: EstadoProyecto;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'Cliente del proyecto. Enviar null para quitar el cliente.',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  id_cliente?: number | null;
}
