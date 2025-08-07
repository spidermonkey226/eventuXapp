//export type UserPermission = 'appadmin' | 'eventmanager' | 'eventhost' | 'regularuser';
import { Permision } from "./permision"; // adjust path if needed
export class User {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  permission: Permision;
  date: Date;

  constructor(
    idUser: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    permission: Permision,
    date: Date
  ) {
    this.idUser = idUser;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.permission = permission;
    this.date = date;
  }
}
