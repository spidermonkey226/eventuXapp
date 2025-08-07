export class Ticket {
  ticketId: number;
  ticketTitle: string;
  ticketStatus: string;
  ticketContent: string;
  reporter: any;
  event: any;

  constructor(
    ticketTitle: string,
    ticketStatus: string,
    ticketContent: string,
    reporter: any,
    event: any,
    ticketId: number = 0
  ) {
    this.ticketId = ticketId;
    this.ticketTitle = ticketTitle;
    this.ticketStatus = ticketStatus;
    this.ticketContent = ticketContent;
    this.reporter = reporter;
    this.event = event;
  }
}