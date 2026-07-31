import { Evento } from "./event";

export type ValidatorToken = {
  id: string;
  token: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  endDate: Date | null;
  eventId: string;
  event?: Pick<Evento, "id" | "title">;
};

export type ValidationAction = "VALIDATE" | "INVALIDATE";

export type ValidatorSessionDeviceData = {
  userAgent: string | null;
  platform: string | null;
  screenResolution: string | null;
  timezone: string | null;
  language: string | null;
};

export type ValidatorSession = {
  id: string;
  validatorTokenId: string;
  eventId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  platform: string | null;
  screenResolution: string | null;
  timezone: string | null;
  language: string | null;
  validatorToken?: Pick<ValidatorToken, "id" | "token" | "notes">;
  _count?: { validationEvents: number };
};

export type ValidationEvent = {
  id: string;
  sessionId: string;
  ticketOrderId: string;
  eventId: string;
  action: ValidationAction;
  createdAt: Date;
  session?: Pick<ValidatorSession, "id" | "token">;
};

export type CreateValidatorSessionInput = {
  validatorTokenId: string;
  eventId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  deviceData: ValidatorSessionDeviceData;
};

export type ValidateTicketResult = {
  success: boolean;
  alreadyValidated: boolean;
};
