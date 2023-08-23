import { Controller, Get, Param } from '@nestjs/common';
import { LifeCycleTriggersService } from '../life-cycle-triggers/life-cycle-triggers.service';

@Controller('on-demand')
export class OnDemandController {
  constructor(private readonly lifeCycleService: LifeCycleTriggersService) {}

  @Get('/getCurrentAlertStatus')
  getAlertStatus() {
    return this.lifeCycleService.alertStatus;
  }

  @Get('/getCurrentWorkoutStatus')
  getWorkoutStatus() {
    return this.lifeCycleService.workoutStatus;
  }

  @Get('/getCurrentWorkoutData/:workoutID')
  getWorkoutData(@Param('workoutID') workoutID: string) {
    return this.lifeCycleService.getWorkoutData(workoutID);
  }
}
