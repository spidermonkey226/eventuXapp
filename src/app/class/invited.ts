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
  coming?: boolean; 
  token: string;
  note?: string;

  constructor(
    firstName: string,
    event: { eventId: number; name: string },
    id: { eventId: number; email: string },
    token: string,
    coming?: boolean,
    note?: string
  ) {
    this.firstName = firstName;
    this.event = event;
    this.id = id;
    this.token = token;
    this.coming = coming;
    this.note = note;
  }
}