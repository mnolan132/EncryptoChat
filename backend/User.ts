class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contacts: number[];

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    contacts: number[]
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.contacts = contacts;
  }
}
