export interface ProducerSummary {
  id: string;
  name: string;
  eventCount: number;
}

export interface SuperadminProducersResponse {
  producers: ProducerSummary[];
}
