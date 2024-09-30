export class Message {
  constructor(
    public senderId: string,
    public recipientId: string,
    public messageContent: string,
    public timestamp: string
  ) {}
}
