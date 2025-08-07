export class Invited {
  id: {
    eventId: number;
    email: string;
  };
  firstName: string;
  event: {
    eventId: number;
    name: string;
  };

  constructor(
    firstName: string,
    event: { eventId: number; name: string },
    id: { eventId: number; email: string }
  ) {
    this.firstName = firstName;
    this.event = event;
    this.id = id;
  }
}