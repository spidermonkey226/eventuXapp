//export type UserPermission = 'appadmin' | 'eventmanager' | 'eventhost' | 'regularuser';
import { Permision } from "./permision"; // adjust path if needed

export enum SubscriptionLevel {
  Free = 0,       // up to 5 events
  Basic = 1,      // up to 20 events
  Standard = 2,   // up to 50 events
  Pro = 3,        // up to 200 events
  Ultimate = 4    // unlimited
}

export class User {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  permision: Permision;
  date: Date;

  subscriptionLevel: SubscriptionLevel;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;

  constructor(
    idUser: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    permision: Permision,
    date: Date,
    subscriptionLevel: SubscriptionLevel = SubscriptionLevel.Free,
    subscriptionStart?: Date,
    subscriptionEnd?: Date
  ) {
    this.idUser = idUser;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.permision = permision;
    this.date = date;
    this.subscriptionLevel = subscriptionLevel;
    this.subscriptionStart = subscriptionStart;
    this.subscriptionEnd = subscriptionEnd;
  }
}
