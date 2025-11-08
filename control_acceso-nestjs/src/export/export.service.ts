// src/export/export.service.ts
import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { AttendanceRecord } from '../attendance/attendance.service';
import type { Response } from 'express';

@Injectable()
export class ExportService {
  async exportToExcel(
    records: AttendanceRecord[],
    res: Response,
    filters?: {
      fechaInicio?: Date;
      fechaFin?: Date;
      usuarioId?: number;
    },
  ) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Control de Asistencia');

    let filteredRecords = [...records];

    if (filters) {
      if (filters.fechaInicio) {
        filteredRecords = filteredRecords.filter(
          (record) => new Date(record.timestamp) >= filters.fechaInicio!,
        );
      }

      if (filters.fechaFin) {
        filteredRecords = filteredRecords.filter(
          (record) => new Date(record.timestamp) <= filters.fechaFin!,
        );
      }

      if (filters.usuarioId) {
        filteredRecords = filteredRecords.filter(
          (record) => record.personaId === filters.usuarioId,
        );
      }
    }

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 20 },
      { header: 'Tarjeta', key: 'tarjeta', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 12 },
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Hora', key: 'hora', width: 10 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };

    if (filteredRecords.length === 0) {
      worksheet.addRow(['No hay registros para los filtros aplicados']);
    } else {
      filteredRecords.forEach((record, index) => {
        const fecha = new Date(record.timestamp);
        worksheet.addRow({
          id: record.id,
          nombre: record.nombre,
          cargo: record.cargo,
          tarjeta: record.tarjeta,
          tipo: record.tipo,
          fecha: fecha.toLocaleDateString('es-ES'),
          hora: fecha.toLocaleTimeString('es-ES'),
        });
      });
    }

    let fileName = 'asistencia';
    if (filters?.fechaInicio)
      fileName += `_${filters.fechaInicio.toISOString().split('T')[0]}`;
    if (filters?.fechaFin)
      fileName += `_a_${filters.fechaFin.toISOString().split('T')[0]}`;
    if (filters?.usuarioId) fileName += `_usuario_${filters.usuarioId}`;
    fileName += '.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  }
}
