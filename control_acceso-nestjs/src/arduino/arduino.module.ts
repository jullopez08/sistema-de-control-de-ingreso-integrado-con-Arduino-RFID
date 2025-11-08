// import { Module } from '@nestjs/common';
// import { ArduinoService } from './arduino.service';
// import { PersonasModule } from 'src/people/personas.module';
// import { AttendanceModule } from 'src/attendance/attendance.module';

// import { ConfigModule, ConfigService } from "@nestjs/config";


// @Module({
//   imports: [ConfigModule,PersonasModule,
//     AttendanceModule],
//   providers: [
//     {
//       provide: SerialPortService,
//       useFactory: (configService: ConfigService) => {
//         const port = configService.get<string>('ARDUINO_PORT') || 'COM7';
//         const baudRate = Number(configService.get<string>('ARDUINO_BAUDRATE')) || 9600;
//         return new SerialPortService(port, baudRate);
//       },
//       inject: [ConfigService],
//     },
//     ArduinoService,
//   ],
//   exports: [SerialPortService, ArduinoService],
// })
// export class ArduinoModule {}
import { Module } from '@nestjs/common';
import { ArduinoService } from './arduino.service';
import { PersonasModule } from 'src/people/personas.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { ConfigModule } from "@nestjs/config";
import { SerialPortService } from 'src/shared/serial.port';

@Module({
  imports: [
    ConfigModule, 
    PersonasModule,
    AttendanceModule
  ],
  providers: [  SerialPortService, ArduinoService],
  exports: [ArduinoService],
})
export class ArduinoModule {}