import { Controller, Get, Param } from '@nestjs/common';
import { InstructorService } from './instructor.service';

@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('myStatus/:name')
  getMyStatus(@Param('name') par: string) {
    return this.instructorService.getStatus(par);
  }

  @Get('setAvailable/:name')
  setAvailable(@Param('name') par: string) {
    return this.instructorService.setAvailable(par);
  }
}
