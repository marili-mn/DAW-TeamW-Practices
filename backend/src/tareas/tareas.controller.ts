import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { TareasService } from './tareas.service';

@ApiTags('tareas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post()
  create(@Body() createTareaDto: CreateTareaDto) {
    return this.tareasService.create(createTareaDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTareaDto: UpdateTareaDto,
  ) {
    return this.tareasService.update(id, updateTareaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tareasService.remove(id);
  }
}
