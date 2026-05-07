import { UserType } from "./user";

export interface UserInvitation {
  id?: string;
  email: string;
  inviterId: string;
  token: string;
  createdAt?: string | Date | undefined;
  role?: UserType | undefined;
  userType?: UserType | null | undefined;
  expiresAt: string | Date;
  updatedAt?: string | Date;
  accepted?: boolean;
  clientId: string;
}
