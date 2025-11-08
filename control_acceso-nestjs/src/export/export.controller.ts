import { Controller, Get, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { AttendanceService } from '../attendance/attendance.service';

@Controller('api/export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly attendanceService: AttendanceService,
  ) {
  }

  @Get('excel')
  async exportExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    try {
      const records = this.attendanceService.getRecords();
      const filters: any = {};

      if (startDate) {
        filters.fechaInicio = new Date(startDate + 'T00:00:00.000Z');
      }

      if (endDate) {
        filters.fechaFin = new Date(endDate + 'T23:59:59.999Z');
      }

      if (usuarioId) {
        filters.usuarioId = parseInt(usuarioId);
      }

      await this.exportService.exportToExcel(records, res, filters);
    } catch (error) {
      return res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message,
      });
    }
  }

  @Get('test')
  testEndpoint() {
    return {
      message: 'Endpoint de exportación funcionando',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('records')
  getRecords(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    try {
      let records = this.attendanceService.getRecords();

      if (startDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        records = records.filter(
          (record) => new Date(record.timestamp) >= startOfDay,
        );
      }

      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        records = records.filter(
          (record) => new Date(record.timestamp) <= endOfDay,
        );
      }

      if (usuarioId) {
        const idUsuario = parseInt(usuarioId);
        if (!isNaN(idUsuario)) {
          records = records.filter((record) => record.personaId === idUsuario);
        }
      }

      return {
        totalRecords: records.length,
        records: records,
        filters: {
          startDate,
          endDate,
          usuarioId,
        },
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}
