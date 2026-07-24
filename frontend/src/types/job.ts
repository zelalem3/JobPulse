export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  scraped_at: string;
  tags?: string[];
  type?: string;
  salary?: string;
  isSaved?: boolean;
  skills?: any[];
}
