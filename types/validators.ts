import { Evento } from "./event";

export type ValidatorToken = {
  id: string;
  token: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  endDate?: Date | null;
  eventId: string;
  useCount: number;
  event: any;
};
