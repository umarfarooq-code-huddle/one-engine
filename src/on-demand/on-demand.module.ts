import { Module } from '@nestjs/common';
import { OnDemandController } from './on-demand/on-demand.controller';
import { LifeCycleTriggersService } from './life-cycle-triggers/life-cycle-triggers.service';
import { InstructorController } from './instructor/instructor.controller';
import { InstructorService } from './instructor/instructor.service';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [OnDemandController, InstructorController, ClientController],
  providers: [LifeCycleTriggersService, InstructorService, ClientService],
})
export class OnDemandModule {}
