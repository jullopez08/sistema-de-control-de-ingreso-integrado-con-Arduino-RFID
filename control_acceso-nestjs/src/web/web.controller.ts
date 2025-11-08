import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ArduinoService } from '../arduino/arduino.service';
import { PersonasService } from '../people/personas.service';

@Controller('api')
export class WebController {
  private readonly logger = new Logger(WebController.name);

  constructor(
    private arduinoService: ArduinoService,
    private eventEmitter: EventEmitter2,
    private personasService: PersonasService
  ) {}

  @Get('status')
  getStatus() {
    return this.arduinoService.getStatus();
  }

  @Get('cards')
  getCards() {
    return {
      success: true,
      cards: this.arduinoService.getCards()
    };
  }

  @Post('command')
  sendCommand(@Body() body: { command: string }) {
    this.logger.log(`Comando REST recibido: ${body.command}`);
    
    const success = this.arduinoService.sendCommand(body.command);
    
    return {
      success,
      message: success ? 'Comando enviado' : 'Error enviando comando'
    };
  }

  @Post('register')
  registerCard(@Body() body: { uid: string; name: string }) {
    this.logger.log(`Registro REST: ${body.uid} - ${body.name}`);
    
    const success = this.arduinoService.registerCard(body.uid, body.name);
    
    return {
      success,
      message: success ? 'Tarjeta registrada' : 'Error registrando tarjeta'
    };
  }
  
  @Post('asignar-tarjeta')
  async asignarTarjeta(@Body() body: { personaId: number; uid: string }) {
    this.logger.log(`Asignando tarjeta ${body.uid} a persona ${body.personaId}`);
    
    const success = this.personasService.asignarTarjeta({
      personaId: body.personaId,
      uid: body.uid
    });

    // if (success) {
    //   const persona = this.personasService.obtenerPorId(body.personaId);
    //   if (persona) {
    //     this.arduinoService.registerCard(body.uid, persona.nombre);
    //   }
    // }

    return {
      success,
      message: success ? 'Tarjeta asignada correctamente' : 'Error asignando tarjeta'
    };
  }

  @Get('personas-sin-tarjeta')
  obtenerPersonasSinTarjeta() {
    return this.personasService.obtenerSinTarjeta();
  }


  @Post('refresh-cards')
  refreshCards() {
    const success = this.arduinoService.requestCards();
    
    return {
      success,
      message: success ? 'Solicitando tarjetas...' : 'Error solicitando tarjetas'
    };
  }
  
}