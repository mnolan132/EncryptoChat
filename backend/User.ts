import { v4 as uuidv4 } from "uuid";

export class User {
  id: string;
  contacts: number[];

  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string
  ) {
    this.id = uuidv4();
    this.contacts = [];
  }
  toPlainObject() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      id: this.id,
      contacts: this.contacts,
    };
  }
}
