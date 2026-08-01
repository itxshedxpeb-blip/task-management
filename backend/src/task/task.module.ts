import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskEvaluationService } from './task-evaluation.service';
import { TaskEventsGateway } from './task-events.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, ScheduleModule.forRoot()],
  controllers: [TaskController],
  providers: [TaskService, TaskEvaluationService, TaskEventsGateway],
  exports: [TaskService],
})
export class TaskModule {
  static readonly moduleCapability = { capability: 'task' } as const;
}
