import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'ACME S.A.' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ example: '+54 11 5555-5555' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@acme.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
