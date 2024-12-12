export class SessionUser {
  constructor(public id: number) {}
}

export interface SessionRememberMeToken {
  tokenableId: number;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}
