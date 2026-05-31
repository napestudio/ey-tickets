export interface CreateProducerInput {
  producer: {
    name: string;
    email: string;
    phone?: string;
    venueType?: string;
    eventCategories?: string[];
  };
  owner: {
    name: string;
    email: string;
    password: string;
  };
}

export interface CreateProducerResult {
  producer: {
    id: string;
    name: string;
    slug: string;
    email: string;
  };
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface ProducerSummary {
  id: string;
  name: string;
  eventCount: number;
}

export interface SuperadminProducersResponse {
  producers: ProducerSummary[];
}

export interface ProducerMemberDetail {
  id: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface ProducerEventSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}

export interface ProducerDetail {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  state: string | null;
  city: string | null;
  logo: string | null;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: ProducerMemberDetail[];
  events: ProducerEventSummary[];
}
