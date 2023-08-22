import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientService {
  public statuses = {};
  public registeredClients = 0;

  getStatus(name) {
    if (this.statuses[name]) return this.statuses[name].status;
    else return 'Not Registered';
  }

  register(name) {
    this.registeredClients += 1;
    this.statuses[name] = { status: 'Registered', priority: '1' };
    return this.statuses[name].status;
  }

  sortClients() {
    // Convert the object into an array of instructors
    const clientsArray = Object.entries(this.statuses);

    // Sort the array in descending order based on avgRate
    clientsArray.sort(([, a], [, b]) => b['priority'] - a['priority']);

    // Convert the sorted array back to an object
    const sortedClients: Record<string, any> = {};
    for (const [name, client] of clientsArray) {
      sortedClients[name] = client;
    }

    return sortedClients;
  }
}
