export class User {
  contacts: number[];

  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public id: string
  ) {
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
