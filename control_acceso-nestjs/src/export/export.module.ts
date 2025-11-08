import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { AttendanceModule } from 'src/attendance/attendance.module';

@Module({
  imports: [AttendanceModule],
  providers: [ExportService],
  controllers: [ExportController]
})
export class ExportModule {}
