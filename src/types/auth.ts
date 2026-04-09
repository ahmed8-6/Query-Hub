export type AuthPayload = {
  userId: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
};
