// src/attendance/attendance.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface AttendanceRecord {
  id: number;
  personaId: number;
  nombre: string;
  cargo: string;
  tarjeta: string;
  tipo: 'ENTRADA' | 'SALIDA';
  timestamp: Date;
}

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  private readonly filePath = join(process.cwd(), 'data', 'attendance.json');

  constructor() {
    this.initializeFile();
  }

  private initializeFile() {
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readRecords(): AttendanceRecord[] {
    try {
      const data = readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.error('Error leyendo registros:', error);
      return [];
    }
  }

  private saveRecords(records: AttendanceRecord[]): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(records, null, 2));
    } catch (error) {
      this.logger.error('Error guardando registros:', error);
    }
  }

  registerAttendance(persona: any, tipo: 'ENTRADA' | 'SALIDA'): void {
    const records = this.readRecords();

    const newRecord: AttendanceRecord = {
      id: records.length + 1,
      personaId: persona.id,
      nombre: persona.nombre,
      cargo: persona.cargo,
      tarjeta: persona.tarjetaAsignada,
      tipo: tipo,
      timestamp: new Date(),
    };

    records.push(newRecord);
    this.saveRecords(records);

    this.logger.log(
      `Registro de ${tipo}: ${persona.nombre} - ${new Date().toLocaleString()}`,
    );
  }

  getRecords(): AttendanceRecord[] {
    return this.readRecords();
  }

  getRecordsByDateRange(startDate: Date, endDate: Date): AttendanceRecord[] {
    const records = this.readRecords();
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    return records.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startOfDay && recordDate <= endOfDay;
    });
  }

  getUltimoRegistro(personaId: number): AttendanceRecord | null {
    const records = this.readRecords();
    const registrosPersona = records
      .filter((record) => record.personaId === personaId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    return registrosPersona.length > 0 ? registrosPersona[0] : null;
  }

  async getRegistrosFiltrados(filters?: {
    fechaInicio?: Date;
    fechaFin?: Date;
    usuarioId?: number;
  }) {
    try {
      let registros = this.getRecords();

      if (filters) {
        if (filters.fechaInicio) {
          registros = registros.filter(
            (registro) => new Date(registro.timestamp) >= filters.fechaInicio!,
          );
        }

        if (filters.fechaFin) {
          const fechaFin = new Date(filters.fechaFin);
          fechaFin.setDate(fechaFin.getDate() + 1);

          registros = registros.filter(
            (registro) => new Date(registro.timestamp) < fechaFin,
          );
        }

        if (filters.usuarioId) {
          registros = registros.filter(
            (registro) => registro.personaId === filters.usuarioId,
          );
        }
      }

      return registros;
    } catch (error) {
      throw error;
    }
  }

  getUltimoRegistroPorTarjeta(tarjeta: string): AttendanceRecord | null {
    const records = this.readRecords();

    const registrosTarjeta = records
      .filter((record) => record.tarjeta === tarjeta)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    return registrosTarjeta.length > 0 ? registrosTarjeta[0] : null;
  }
}
