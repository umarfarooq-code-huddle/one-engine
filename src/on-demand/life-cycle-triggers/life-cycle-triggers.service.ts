import { Injectable } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InstructorService } from '../instructor/instructor.service';

export enum SessionSchedulingStage {
  DoesNotExist = 'not-exists',
  Initialized = 'initialized',
  InstructorsAskedForConfirmation = 'instructors-asked-for-confirmation',
  StartClientRequestConfirmation = 'start-client-requests-confirmation',
  TrainerBatchesConfirmed = 'trainer-batches-confirmed',
  ClassesCreated = 'classes-created',
  Finished = 'finished',
}

@Injectable()
export class LifeCycleTriggersService {
  public CLIENTS_PER_WORKOUT = 5;
  public workouts;
  public alertStatus;
  public workoutStatus;
  public sesssionStatus: SessionSchedulingStage =
    SessionSchedulingStage.DoesNotExist;
  constructor(
    private readonly instructorService: InstructorService,
    private readonly clientService: ClientService,
  ) {
    this.alertStatus = 'Enough';
    this.workoutStatus = 'Scheduled';
  }

  isCurrentMinuteMultipleOf10() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    return currentMinute % 10 === 0;
  }
  initializeIfNot() {
    //  if (this.isCurrentMinuteMultipleOf10()) {
    console.log('--------LIFE_CYCLE METHOD RESTARTED----------');
    this.sesssionStatus = SessionSchedulingStage.Initialized;
    this.clientService.registeredClients = 0;
    this.workouts = 0;
    this.alertStatus = 'Enough';
    this.instructorService.availableInstructors = 0;
    this.instructorService.neededInstructors = 0;
    this.instructorService.instructors = {};
    this.clientService.statuses = {};
    //   }
  }

  @Cron(
    //'0 0,2,3,5,7,9,10,12,13,15,17,19,20,22,23,25,27,29,30,32,33,35,37,39,40,42,43,45,47,49,50,52,53,55,57,59 * * * *',
    CronExpression.EVERY_30_SECONDS,
  )
  triggerLiveCycleMethods() {
    const clients = this.clientService.registeredClients;
    const avInstructors = this.instructorService.availableInstructors;

    this.workouts = Math.ceil(clients / this.CLIENTS_PER_WORKOUT);
    const totalInstructors = this.workouts * 3;

    if (this.sesssionStatus == SessionSchedulingStage.DoesNotExist) {
      this.initializeIfNot();
    } else if (this.sesssionStatus == SessionSchedulingStage.Initialized) {
      this.sesssionStatus =
        SessionSchedulingStage.InstructorsAskedForConfirmation;

      if (avInstructors < totalInstructors) {
        this.instructorService.neededInstructors =
          totalInstructors - avInstructors;
      } else this.instructorService.neededInstructors = 0;

      if (this.instructorService.neededInstructors > 5)
        this.alertStatus = 'Needed Urgently';
      else if (this.instructorService.neededInstructors > 0)
        this.alertStatus = 'Needed';
      else this.alertStatus = 'Enough';
    } else if (
      this.sesssionStatus ==
      SessionSchedulingStage.InstructorsAskedForConfirmation
    ) {
      this.sesssionStatus =
        SessionSchedulingStage.StartClientRequestConfirmation;

      const sortedClients = this.clientService.sortClients();

      const clientsToConfirm =
        Math.ceil(this.instructorService.availableInstructors / 3) * 5;

      let i = 0;
      for (const name in sortedClients) {
        if (i > clientsToConfirm) break;

        i++;
        sortedClients[name].status = 'Confirmed';
      }
      this.clientService.statuses = sortedClients;
    } else if (
      this.sesssionStatus ==
      SessionSchedulingStage.StartClientRequestConfirmation
    ) {
      this.sesssionStatus = SessionSchedulingStage.TrainerBatchesConfirmed;

      const trainersNeeded =
        Math.ceil(this.clientService.registeredClients / 5) * 3;

      const trainersBatch = Math.min(
        trainersNeeded,
        this.instructorService.availableInstructors,
      );

      const sortedInstructors = this.instructorService.sortInstructors();

      // Convert the object into an array of instructors
      const sortedTrainers = Object.values(sortedInstructors);

      const confirmWorkouts = Math.ceil(trainersBatch / 3);

      // Initialize an array to store the workouts
      const workouts = [];

      // Initialize an array to keep track of assigned trainers
      const assignedTrainers = {};

      // Assign lead trainers to workouts
      for (
        let workoutNumber = 1;
        workoutNumber <= confirmWorkouts;
        workoutNumber++
      ) {
        // Get the keys (names) of instructors
        const instructorNames = Object.keys(sortedInstructors);

        // Determine the lead trainer for this workout
        const leadTrainerIndex = (workoutNumber - 1) % instructorNames.length;
        const leadTrainerName = instructorNames[leadTrainerIndex];
        const leadTrainer = sortedInstructors[leadTrainerName];

        // Update the lead trainer's workout and role
        leadTrainer.role = 'leadTrainer';
        leadTrainer.workout = `Workout-${workoutNumber}`;
        assignedTrainers[leadTrainerName] = leadTrainer;

        // Remove the assigned lead trainer from the object
        delete sortedInstructors[leadTrainerName];

        // Store the completed workout
        workouts.push({
          workoutNumber: `Workout-${workoutNumber}`,
          trainers: [assignedTrainers[leadTrainerName]],
        });

        // Clear the assignedTrainers array for the next iteration
//        assignedTrainers.length = 0;
      }

      // Assign coaches to workouts if there are remaining trainers
      let coachNumber = 1;
      const remainingInstructorNames = Object.keys(sortedInstructors);
      for (let i = 0; i < remainingInstructorNames.length; i++) {
        const instructorName = remainingInstructorNames[i];
        const coach = sortedInstructors[instructorName];
        coach.role = `coach${coachNumber}`;
        coach.workout = workouts[i % workouts.length].workoutNumber;
        coachNumber++;
      }

      for (const name in assignedTrainers){
        sortedInstructors[name] = assignedTrainers[name];
      }

      // Now the 'workouts' array contains the information about trainers assigned to each workout,
      // and 'sortedInstructors' has been updated with the workout and role information
      console.log(JSON.stringify(workouts));
      console.log(JSON.stringify(sortedInstructors));
      this.instructorService.instructors = sortedInstructors;
      
    } else if (
      this.sesssionStatus == SessionSchedulingStage.TrainerBatchesConfirmed
    ) {
      this.sesssionStatus = SessionSchedulingStage.ClassesCreated;
    } else if (this.sesssionStatus == SessionSchedulingStage.ClassesCreated) {
      this.sesssionStatus = SessionSchedulingStage.DoesNotExist;
    }

    console.log(
      '-----------------------' +
        this.sesssionStatus +
        '--------------------------------',
    );

    console.log('Workouts Needed:' + this.workouts);
    console.log('Registered Clients:' + clients);
    console.log('Available Instructors:' + avInstructors);
    console.log(
      'Needed Instructors:' + this.instructorService.neededInstructors,
    );
    console.log('Alert Status:' + this.alertStatus);
  }

  @Cron(
    //'0 0,2,3,5,7,9,10,12,13,15,17,19,20,22,23,25,27,29,30,32,33,35,37,39,40,42,43,45,47,49,50,52,53,55,57,59 * * * *',
    CronExpression.EVERY_10_SECONDS,
  )
  updateEvents() {
    const clients = this.clientService.registeredClients;
    const avInstructors = this.instructorService.availableInstructors;

    this.workouts = Math.ceil(clients / this.CLIENTS_PER_WORKOUT);
    const totalInstructors = this.workouts * 3;

    if (avInstructors < totalInstructors) {
      this.instructorService.neededInstructors =
        totalInstructors - avInstructors;
    } else this.instructorService.neededInstructors = 0;

    if (this.instructorService.neededInstructors > 5)
      this.alertStatus = 'Needed Urgently';
    else if (this.instructorService.neededInstructors > 0)
      this.alertStatus = 'Needed';
    else this.alertStatus = 'Enough';
  }
}
