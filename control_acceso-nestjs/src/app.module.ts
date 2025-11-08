import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ArduinoModule } from './arduino/arduino.module';
import { EventsModule } from './events/events.module';
import { WebModule } from './web/web.module';
import { PersonasModule } from './people/personas.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ExportModule } from './export/export.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    EventEmitterModule.forRoot(),
    ArduinoModule,
    EventsModule,
    WebModule,
    PersonasModule,
    AttendanceModule,
    ExportModule,
  ],
})
export class AppModule {}