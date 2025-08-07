export class EventModel {
    id : number;
    name: string;
    email: string;
    phone: string;
    street: string;
    streetNumber: string;
    postCode: string;
    city: string;
    date: string; 
    people: number;
    comments: string;
  
    constructor(
      name: string,
      email: string,
      phone: string,
      street: string,
      streetNumber: string,
      postCode: string,
      city: string,
      date: string,
      people: number,
      comments: string,
      id: number 
    ) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.phone = phone;
      this.street = street;
      this.streetNumber = streetNumber;
      this.postCode = postCode;
      this.city = city;
      this.date = date;
      this.people = people;
      this.comments = comments;
    }
  }