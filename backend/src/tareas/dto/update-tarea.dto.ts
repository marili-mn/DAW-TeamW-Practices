import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoTarea } from '../tarea.entity';

export class UpdateTareaDto {
  @ApiPropertyOptional({ example: 'Diseñar la base de datos' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @ApiPropertyOptional({ enum: EstadoTarea })
  @IsOptional()
  @IsEnum(EstadoTarea)
  estado?: EstadoTarea;
}
