export class User {
  contacts: string[];
  secret: number;

  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public id: string
  ) {
    this.contacts = [];
    this.secret = 0;
  }
}
