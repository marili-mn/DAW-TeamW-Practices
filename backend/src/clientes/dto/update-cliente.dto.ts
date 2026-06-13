import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
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

  @ApiPropertyOptional({ example: '+54 11 5555-5555', nullable: true })
  @IsOptional()
  @IsString()
  telefono?: string | null;

  @ApiPropertyOptional({ example: 'contacto@acme.com', nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;
}
