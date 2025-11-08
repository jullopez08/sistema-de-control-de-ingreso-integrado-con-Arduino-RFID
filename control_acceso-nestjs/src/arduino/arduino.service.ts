import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { SerialPortService } from '../shared/serial.port';
import { ConfigService } from '@nestjs/config';
import { RFIDEvent, Card } from './interfaces/rfid-event.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PersonasService } from '../people/personas.service';
import { AttendanceService } from 'src/attendance/attendance.service';

@Injectable()
export class ArduinoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ArduinoService.name);
  // private cards: Card[] = [];

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private personasService: PersonasService,
    private attendanceService: AttendanceService,
    private serialPort: SerialPortService,
  ) {}

  onModuleInit() {
    this.serialPort.on('data', (data: RFIDEvent) => {
      this.handleRFIDEvent(data);
    });

    this.serialPort.on('serial_error', (error) => {
      this.logger.error(`Error en conexión Arduino: ${error.message}`);
      this.eventEmitter.emit('arduino.error', error);
    });

    this.serialPort.on('connected', () => {
      this.logger.log('Conexión con Arduino establecida exitosamente');
      this.eventEmitter.emit('arduino.connected');
    });
  }

  onModuleDestroy() {
    if (this.serialPort) {
      this.serialPort.close();
      this.logger.log('Conexión con Arduino cerrada');
    }
  }

  private handleRFIDEvent(event: RFIDEvent) {
    this.logger.debug(`Evento RFID recibido: ${event.type} - ${event.message}`);
    this.eventEmitter.emit('rfid.event', event);

    if (event.type === 'raw' && event.message.startsWith('CHECK_ACCESS:')) {
      this.handleCheckAccess(event.message);
    }
  }

  private async handleCheckAccess(message: string) {
    try {
      const uid = message.replace('CHECK_ACCESS:', '').trim();

      this.logger.debug(`Verificando acceso para UID: ${uid}`);

      const persona = await this.personasService.buscarPorTarjeta(uid);

      if (persona) {
        this.logger.log(`Acceso permitido para: ${persona.nombre}`);

        let tipo: 'ENTRADA' | 'SALIDA';
        const ultimoRegistro =
          this.attendanceService.getUltimoRegistroPorTarjeta(uid);

        if (ultimoRegistro) {
          tipo = ultimoRegistro.tipo === 'ENTRADA' ? 'SALIDA' : 'ENTRADA';
          this.logger.debug(
            `Alternando acceso: ${ultimoRegistro.tipo} → ${tipo} para ${persona.nombre}`,
          );
        } else {
          tipo = 'ENTRADA';
          this.logger.debug(`Primer acceso - ENTRADA de ${persona.nombre}`);
        }

        this.attendanceService.registerAttendance(persona, tipo);
        this.sendCommand('TOGGLE_DOOR');

        this.eventEmitter.emit('rfid.event', {
          type: 'access',
          message: `${tipo}: ${persona.nombre} - ${persona.cargo}`,
          timestamp: new Date(),
          raw: message,
        });

        this.eventEmitter.emit('rfid.event', {
          type: 'info',
          message: `REGISTRO: ${tipo} - ${persona.nombre} ${tipo === 'ENTRADA' ? 'ingresó' : 'salió'} del área`,
          timestamp: new Date(),
        });
      } else {
        this.logger.warn(
          `Tarjeta no registrada: ${uid} - Solicitando registro`,
        );
        this.sendCommand('REQUEST_REGISTER');

        this.eventEmitter.emit('registration.pending', { uid: uid });
      }
    } catch (error) {
      this.logger.error(`Error en verificación de acceso: ${error.message}`);
      this.eventEmitter.emit('arduino.error', error);
    }
  }

  sendCommand(command: string): boolean {
    this.logger.debug(`Enviando comando a Arduino: ${command}`);
    return this.serialPort.sendCommand(command);
  }

  registerCard(uid: string, name: string): boolean {
    const command = `REGISTER_SUCCESS:${uid}`;
    this.logger.log(`Registrando tarjeta: ${name} (${uid})`);
    return this.sendCommand(command);
  }

  requestCards(): boolean {
    this.logger.debug('Solicitando lista de tarjetas a Arduino');
    return this.sendCommand('GET_CARDS');
  }

  async getCards(): Promise<Card[]> {
    try {
      const personas = await this.personasService.obtenerTodas();

      return personas
        .filter(
          (persona) =>
            persona.tarjetaAsignada && persona.tarjetaAsignada.trim() !== '',
        )
        .map((persona) => ({
          uid: persona.tarjetaAsignada as string,
          name: persona.nombre,
        }));
    } catch (error) {
      this.logger.error('Error obteniendo tarjetas:', error);
      return [];
    }
  }

  getStatus() {
    return {
      connected: this.serialPort?.isConnected || false,
      port: this.configService.get<string>('ARDUINO_PORT') || 'COM3',
      baudRate: Number(
        this.configService.get<number>('ARDUINO_BAUDRATE') || 9600,
      ),
    };
  }
}
