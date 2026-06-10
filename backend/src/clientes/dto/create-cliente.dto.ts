import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'ACME S.A.' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
