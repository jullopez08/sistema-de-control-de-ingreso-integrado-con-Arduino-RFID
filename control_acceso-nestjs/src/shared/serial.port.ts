import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { EventEmitter } from 'events';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SerialPortService extends EventEmitter {
  private readonly logger = new Logger(SerialPortService.name);
  private port: SerialPort;
  private parser: ReadlineParser;
  public isConnected = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectTimeout: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    super();
    this.initializeConnection();
  }

  private initializeConnection() {
    const portName = this.configService.get<string>('ARDUINO_PORT') || 'COM3';
    const baudRate =
      Number(this.configService.get<string>('ARDUINO_BAUDRATE')) || 9600;

    this.logger.log(
      `Intentando conectar a ${portName} con baud rate ${baudRate}`,
    );
    this.connect(portName, baudRate);
  }

  private connect(portName: string, baudRate: number) {
    try {
      this.port = new SerialPort({
        path: portName,
        baudRate: baudRate,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        lock: false, 
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      this.port.on('open', () => {
        // this.logger.log(` Conectado a Arduino en ${portName}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      });

      this.port.on('close', () => {
        this.logger.warn(' Puerto serial cerrado - Intentando reconectar...');
        this.isConnected = false;
        this.emit('disconnected');
        this.scheduleReconnection();
      });

      this.port.on('error', (error) => {
        this.logger.error(` Error serial: ${error.message}`);
        this.isConnected = false;
        this.emit('serial_error', { message: error.message });
        this.scheduleReconnection();
      });

      this.parser.on('data', (data) => {
        this.logger.debug(` Dato recibido: ${data}`);
        this.processData(data);
      });
    } catch (error) {
      this.logger.error(` Error conectando: ${error.message}`);
      this.emit('serial_error', { message: error.message });
      this.scheduleReconnection();
    }
  }

  private scheduleReconnection() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * this.reconnectAttempts, 10000);

      this.logger.warn(
        `🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`,
      );

      this.reconnectTimeout = setTimeout(() => {
        this.initializeConnection();
      }, delay);
    } else {
      this.logger.error(' Máximo número de intentos de reconexión alcanzado');
    }
  }

  private processData(data: string) {
    const trimmedData = data.trim();
    if (!trimmedData) return;

    if (trimmedData.startsWith('WEB:')) {
      const parts = trimmedData.split(':');
      if (parts.length >= 3) {
        const eventType = parts[1];
        const message = parts.slice(2).join(':');

        const eventData = {
          type: eventType,
          message: message,
          timestamp: new Date(),
          raw: trimmedData,
        };

        this.emit('data', eventData);
      }
    } else if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
      try {
        const jsonData = JSON.parse(trimmedData);
        if (jsonData.accion === 'nueva_tarjeta' && jsonData.uid) {
          const eventData = {
            type: 'double',
            message: jsonData.uid,
            timestamp: new Date(),
            raw: trimmedData,
          };
          this.logger.log(
            ` Detectado evento DOUBLE desde JSON: ${jsonData.uid}`,
          );
          this.emit('data', eventData);
        }
      } catch (error) {
        this.emit('data', {
          type: 'raw',
          message: trimmedData,
          timestamp: new Date(),
          raw: trimmedData,
        });
      }
    } else {
      this.emit('data', {
        type: 'raw',
        message: trimmedData,
        timestamp: new Date(),
        raw: trimmedData,
      });
    }
  }

  sendCommand(command: string): boolean {
    if (!this.isConnected || !this.port) {
      this.emit('error', {
        type: 'send_error',
        message: 'Arduino no conectado',
      });
      return false;
    }

    try {
      this.port.write(command + '\n');
      this.logger.log(` Comando enviado: ${command}`);
      return true;
    } catch (error) {
      this.logger.error(` Error enviando comando: ${error}`);
      return false;
    }
  }

  close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.port && this.isConnected) {
      this.port.close();
    }
  }
}
