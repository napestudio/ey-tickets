import { EventCategory } from "@/types/event";

export type EventType = "PUBLIC" | "PRIVATE";

export type DateTimeSelection = {
  id: number;
  date: string;
};

export type WizardStep1Data = {
  title: string;
  description: string;
  category: EventCategory | null;
  legalText: string;
  website: string;
  restrictions: string[];
  ageRestriction: number | null;
};

export type WizardStep2Data = {
  eventType: EventType;
};

export type WizardStep3Data = {
  dateTimeSelections: DateTimeSelection[];
  saleEndDate: Date;
};

export type WizardStep4Data = {
  state: string;
  city: string;
  address: string;
  venue: string;
};

export type WizardStep5Data = {
  files: File[];
  imageUrl: string;
  uploadedImageUrl: string;
  imagePublicId: string | null;
  fileUpdated: boolean;
};

export type WizardState = {
  step1: WizardStep1Data | null;
  step2: WizardStep2Data | null;
  step3: WizardStep3Data | null;
  step4: WizardStep4Data | null;
  step5: WizardStep5Data | null;
  createdEventId: string | null;
};

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
