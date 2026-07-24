export interface Skill {
  id?: number;
  name?: string;
  title?: string;
}
export interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  source: string;
  url: string;
  scrapedAt: string;
  isSaved: boolean;
  description: string;
  companyWebsite?: string;
  skills?: (Skill | string)[];
}