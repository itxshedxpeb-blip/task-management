import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { TaskModule } from './task/task.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmployeePerformanceModule } from './modules/employee-performance/employee-performance.module';
import { DepartmentModule } from './modules/departments/department.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { LabelModule } from './modules/labels/label.module';
import { TemplateModule } from './modules/templates/template.module';
import { AutomationModule } from './modules/automations/automation.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SearchModule } from './modules/search/search.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NotesModule } from './modules/notes/notes.module';
import { AppVersionModule } from './modules/app-version/app-version.module';
import { HealthModule } from './modules/health/health.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttlMs') || 60000,
          limit: config.get<number>('throttle.limit') || 60,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    TaskModule,
    AdminModule,
    EmployeePerformanceModule,
    DepartmentModule,
    NotificationModule,
    LabelModule,
    TemplateModule,
    AutomationModule,
    CalendarModule,
    ReportsModule,
    SearchModule,
    SettingsModule,
    NotesModule,
    AppVersionModule,
    HealthModule,
    MonitoringModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
