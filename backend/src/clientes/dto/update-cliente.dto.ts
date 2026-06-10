import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoCliente } from '../cliente.entity';

export class UpdateClienteDto {
  @ApiPropertyOptional({ example: 'ACME S.A.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional({ enum: EstadoCliente })
  @IsOptional()
  @IsEnum(EstadoCliente)
  estado?: EstadoCliente;
}
