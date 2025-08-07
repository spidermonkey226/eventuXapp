export class Address {
  addressId: number;
  city: string;
  street_name: string;
  street_number: string;
  post_Code: string;

  constructor(
    city: string,
    street_name: string,
    street_number: string,
    post_Code: string,
    addressId: number = 0
  ) {
    this.addressId = addressId;
    this.city = city;
    this.street_name = street_name;
    this.street_number = street_number;
    this.post_Code = post_Code;
  }
}
