export interface Job {
  id: number;
  title: string;
  company: string | null;
  location: string | null;

  description?: string | null;

  salary: string | null;

  job_type?: string | null;
  type?: string | null;

  source: string | null;

  apply_link?: string | null;
  deadline?: string | null;

  scraped_at?: string | null;
  created_at?: string | null;

  skills: Array<
    | string
    | {
        id?: number;
        name?: string;
        title?: string;
      }
  >;

  isSaved?: boolean;
  employment_type: string | null
  experience_level: string | null
  
}