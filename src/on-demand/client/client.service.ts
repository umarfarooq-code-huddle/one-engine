import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientService {
  public clients = {};
  public registeredClients = 0;

  getStatus(name) {
    if (this.clients[name]) return this.clients[name].status;
    else return 'Not Registered';
  }

  register(name, nInvitees, invitedBy) {
    if (this.clients[name]) return 'Registered';
    if (invitedBy != 'None') {
      const priority = this.clients[invitedBy].priority;

      for (const client in this.clients) {
        if (
          client.includes(invitedBy) &&
          client != invitedBy &&
          this.clients[client].priority == priority
        ) {
          this.clients[name] = this.clients[client];
          //   delete this.clients[client];
          delete this.clients[client];
          break;
          //delete Object.assign();
        }
      }

      return this.clients[name].status;
    }
    if (nInvitees == 0) {
      this.registeredClients += 1;
      this.clients[name] = {
        status: 'Registered',
        priority: this.registeredClients,
      };
      return this.clients[name].status;
    } else {
      this.registeredClients += 1;
      this.clients[name] = {
        status: 'Registered',
        priority: this.registeredClients,
      };
      const priority = this.registeredClients;
      for (let i = 0; i < nInvitees; i++) {
        this.clients[name + '-' + (i + 1)] = {
          status: 'Registered',
          priority: priority,
        };
        this.registeredClients += 1;
      }

      return this.clients[name].status;
    }
  }

  sortClients() {
    // Convert the object into an array of instructors
    const clientsArray = Object.entries(this.clients);

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
