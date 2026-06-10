import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'clave' })
  @IsString()
  @IsNotEmpty()
  clave: string;
}
