import { v4 as uuidv4 } from "uuid";

export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contacts: number[];

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) {
    this.id = uuidv4();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.contacts = [];
  }
}
