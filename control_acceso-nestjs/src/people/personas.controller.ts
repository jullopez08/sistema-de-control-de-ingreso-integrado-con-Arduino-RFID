import { Controller, Get, Post, Body, Logger, Param } from '@nestjs/common';
import { PersonasService } from './personas.service';
import type {
  Persona,
  AsignarTarjetaDto,
} from './interfaces/personas.interface';

@Controller('api/personas')
export class PersonasController {
  private readonly logger = new Logger(PersonasController.name);

  constructor(private readonly personasService: PersonasService) {}

  @Get()
  obtenerTodas() {
    return this.personasService.obtenerTodas();
  }

  @Get('sin-tarjeta')
  obtenerSinTarjeta() {
    return this.personasService.obtenerSinTarjeta();
  }

  @Post('asignar-tarjeta')
  asignarTarjeta(@Body() dto: AsignarTarjetaDto) {
    const success = this.personasService.asignarTarjeta(dto);

    return {
      success,
      message: success
        ? 'Tarjeta asignada correctamente'
        : 'Error asignando tarjeta',
    };
  }

  @Get('por-tarjeta/:uid')
  buscarPorTarjeta(@Param('uid') uid: string) {
    return this.personasService.buscarPorTarjeta(uid);
  }
  @Get('tarjetas-registradas')
  obtenerTarjetasRegistradas() {
    const personasConTarjeta = this.personasService.obtenerConTarjeta();

    return {
      personas: personasConTarjeta,
      total: personasConTarjeta.length,
    };
  }
}
