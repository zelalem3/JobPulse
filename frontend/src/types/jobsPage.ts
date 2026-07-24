export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  source: string;
  salary: string;
  scrapedAt: string;
  isSaved: boolean;
  skills: any[]; // Can be string or relational object from backend
}
