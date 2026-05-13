import { OrganizationRole } from "./user";

export interface UserInvitation {
  id?: string;
  email: string;
  inviterId: string;
  producerId: string;
  token: string;
  createdAt?: string | Date | undefined;
  role?: OrganizationRole | undefined;
  expiresAt: string | Date;
  updatedAt?: string | Date;
  accepted?: boolean;
}
