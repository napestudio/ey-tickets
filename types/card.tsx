export interface BasicCard {
  id: string;
  title: string;
  description: string;
  image: string | null;
  producerId?: string;
}

export interface HomeCard extends BasicCard {
  dates: string | null;
  location: string | null;
}

export interface DashboardCard extends BasicCard {}
