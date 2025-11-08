import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Persona, AsignarTarjetaDto } from './interfaces/personas.interface';

@Injectable()
export class PersonasService {
  private readonly logger = new Logger(PersonasService.name);
  private readonly filePath = join(process.cwd(), 'data', 'personas.json');

  constructor() {
    this.logger.log(`Usando base de datos: ${this.filePath}`);
  }

  private readPersonas(): Persona[] {
    try {
      const data = readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.error('Error leyendo personas:', error);
      throw new Error('No se pudo leer la base de datos de personas');
    }
  }

  private savePersonas(personas: Persona[]): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(personas, null, 2));
    } catch (error) {
      this.logger.error('Error guardando personas:', error);
      throw new Error('No se pudo guardar en la base de datos');
    }
  }

  obtenerTodas(): Persona[] {
    return this.readPersonas();
  }

  obtenerSinTarjeta(): Persona[] {
    const personas = this.readPersonas();
    return personas.filter((p) => p.tarjetaAsignada === null);
  }

  obtenerPorId(id: number): Persona | null {
    const personas = this.readPersonas();
    return personas.find((p) => p.id === id) || null;
  }

  asignarTarjeta(dto: AsignarTarjetaDto): boolean {
    const personas = this.readPersonas();
    const personaIndex = personas.findIndex((p) => p.id === dto.personaId);

    if (personaIndex === -1) {
      this.logger.error(`Persona con ID ${dto.personaId} no encontrada`);
      return false;
    }

    const tarjetaYaAsignada = personas.find(
      (p) => p.tarjetaAsignada === dto.uid,
    );
    if (tarjetaYaAsignada) {
      return false;
    }

    personas[personaIndex].tarjetaAsignada = dto.uid;
    this.savePersonas(personas);

    this.logger.log(
      `Tarjeta ${dto.uid} asignada a ${personas[personaIndex].nombre}`,
    );
    return true;
  }

  buscarPorTarjeta(uid: string): Persona | null {
    const personas = this.readPersonas();
    return personas.find((p) => p.tarjetaAsignada === uid) || null;
  }

  obtenerConTarjeta(): Persona[] {
    const personas = this.readPersonas();
    return personas.filter(
      (p) => p.tarjetaAsignada !== null && p.tarjetaAsignada !== '',
    );
  }
}
