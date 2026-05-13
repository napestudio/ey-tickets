export interface UserConfiguration {
  id: string;
  userId: string;
  eventSoldOutNotification: boolean;
  ticketTypeSoldOutNotification: boolean;
  eventToBeSoldOutNotification: boolean;
  ticketTypePublishedNotification: boolean;
}

export interface ProducerConfiguration {
  id: string;
  producerId: string;
  serviceCharge: number | null;
  maxValidatorsPerEvent: number | null;
  maxInvitesPerEvent: number | null;
  maxTicketsPerEvent: number | null;
}
