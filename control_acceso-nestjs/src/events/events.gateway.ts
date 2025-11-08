import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RFIDEvent, Card } from '../arduino/interfaces/rfid-event.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private eventEmitter: EventEmitter2) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.logger.debug('Configurando listeners de eventos WebSocket');

    this.eventEmitter.on('rfid.event', (event: RFIDEvent) => {
      this.logger.debug(`Evento RFID recibido: ${event.type}`);
      this.server.emit('rfid_event', event);
    });

    this.eventEmitter.on('card.added', (card: Card) => {
      this.logger.debug(`Tarjeta agregada: ${card.uid}`);
      this.server.emit('card_added', card);
    });

    this.eventEmitter.on('registration.pending', (data: any) => {
      const uid = typeof data === 'string' ? data : data.uid;
      this.logger.debug(`Registro pendiente para UID: ${uid}`);
      this.server.emit('registration_pending', { uid });
    });

    this.eventEmitter.on('arduino.connected', () => {
      this.logger.log('Arduino conectado - notificando clientes');
      this.server.emit('system_status', {
        status: 'connected',
        message: 'Arduino conectado',
      });
    });

    this.eventEmitter.on('arduino.error', (error) => {
      this.logger.error(`Error de Arduino: ${error.message}`);
      this.server.emit('system_error', error);
    });
  }

  handleConnection(client: Socket) {
    // this.logger.log(`Cliente conectado: ${client.id}`);
    client.emit('system_status', {
      status: 'connected',
      message: 'Conectado al sistema RFID',
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('get_cards')
  handleGetCards(client: Socket) {
    this.logger.debug(`Solicitud de tarjetas desde cliente: ${client.id}`);
  }

  @SubscribeMessage('send_command')
  handleCommand(client: Socket, data: { command: string }) {
    this.logger.log(`Comando recibido: ${data.command} de ${client.id}`);
    this.eventEmitter.emit('arduino.command', data.command);
  }

  @SubscribeMessage('register_card')
  handleRegisterCard(client: Socket, data: { uid: string; name: string }) {
    // this.logger.log(
    //   `Registro de tarjeta solicitado: ${data.uid} - ${data.name}`,
    // );
    this.eventEmitter.emit('arduino.register', data);
  }
}
