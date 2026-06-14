import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Devuelve un access_token JWT válido por 8 h.' })
  @ApiResponse({ status: 200, description: 'Login exitoso — devuelve { access_token, nombre, rol }.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o usuario dado de baja.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
