import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProyectoDto {
  @ApiProperty({ example: 'Sistema de gestión' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Cliente del proyecto. Omitir si es un proyecto interno.',
  })
  @IsOptional()
  @IsInt()
  id_cliente?: number;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Fecha de finalización objetivo (YYYY-MM-DD).',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}
