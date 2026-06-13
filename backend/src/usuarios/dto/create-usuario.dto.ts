import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}