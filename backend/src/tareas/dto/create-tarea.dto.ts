import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateTareaDto {
  @ApiProperty({ example: 'Diseñar la base de datos' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_proyecto: number;
}
