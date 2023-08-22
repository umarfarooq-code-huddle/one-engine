import { Controller, Get, Param } from '@nestjs/common';
import { ClientService } from './client.service';
import { InstructorService } from '../instructor/instructor.service';

@Controller('client')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly instructorService: InstructorService,
  ) {}

  @Get('myStatus/:name')
  getMyStatus(@Param('name') par: string) {
    return this.clientService.getStatus(par);
  }

  @Get('register/:name')
  setAvailable(@Param('name') par: string) {
    return this.clientService.register(par);
  }

  @Get('rate/:InstructorName/:InstructorRating')
  rateInstructor(
    @Param('InstructorName') iName: string,
    @Param('InstructorRating') iRating: number,
  ) {
    return this.instructorService.rate(iName, iRating);
  }
}
