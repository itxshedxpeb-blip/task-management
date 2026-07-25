import { Module } from '@nestjs/common';
import { LabelController, TaskLabelController } from './label.controller';
import { LabelService } from './label.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LabelController, TaskLabelController],
  providers: [LabelService],
  exports: [LabelService],
})
export class LabelModule {}
