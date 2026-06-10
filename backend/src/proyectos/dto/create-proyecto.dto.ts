import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
