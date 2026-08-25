import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskEvaluationService } from './task-evaluation.service';
import { TaskEventsGateway } from './task-events.gateway';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityController } from './task-activity.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, ScheduleModule.forRoot()],
  controllers: [TaskController, TaskActivityController],
  providers: [TaskService, TaskEvaluationService, TaskEventsGateway, TaskActivityService],
  exports: [TaskService, TaskActivityService],
})
export class TaskModule {
  static readonly moduleCapability = { capability: 'task' } as const;
}
