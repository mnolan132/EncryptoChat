export class User {
  contacts: string[];
  secret: number;

  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public id: string,
    public publicKey: string,
    public privateKey: string
  ) {
    this.contacts = [];
    this.secret = 0;
  }
}
