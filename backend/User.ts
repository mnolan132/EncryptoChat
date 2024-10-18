export class User {
  contacts: string[];
  secret: number;
  profilePicture?: string 

  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public id: string,
    profilePicture?: string
  ) {
    this.contacts = [];
    this.secret = 0;
    this.profilePicture = profilePicture;
  }
}
