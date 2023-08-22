import { Injectable } from '@nestjs/common';

@Injectable()
export class InstructorService {
  public availableInstructors = 0;
  public neededInstructors = 0;
  public instructors = {};

  getStatus(name) {
    return this.instructors[name];
  }

  setAvailable(name) {
    this.availableInstructors += 1;
    this.neededInstructors -= 1;
    if (this.instructors[name]) this.instructors[name].status = 'Available';
    else this.instructors[name] = { status: 'Available' };
    return 'Available';
  }

  rate(name, rate) {
    if (this.instructors[name].rating) this.instructors[name].rating.push(rate);
    else this.instructors[name].rating = [rate];

    let sum = 0;

    for (const num of this.instructors[name].rating) {
      sum += +num;
    }

    this.instructors[name].avgRate = sum / this.instructors[name].rating.length;
  }

  sortInstructors() {
    // Convert the object into an array of instructors
    const instructorsArray = Object.entries(this.instructors);

    // Sort the array in descending order based on avgRate
    instructorsArray.sort(([, a], [, b]) => b['avgRate'] - a['avgRate']);

    // Convert the sorted array back to an object
    const sortedInstructors: Record<string, any> = {};
    for (const [name, instructor] of instructorsArray) {
      sortedInstructors[name] = instructor;
    }

    return sortedInstructors;
  }
}
