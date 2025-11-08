import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { HomeController } from './home.controller';
import { ArduinoModule } from '../arduino/arduino.module';
import { PersonasModule } from '../people/personas.module';

@Module({
  imports: [
    ArduinoModule,
    PersonasModule,
  ],
  controllers: [WebController, HomeController],
})
export class WebModule {}