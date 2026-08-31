export interface Skill {
  id: number;
  name: string;
  title?: string;
}

export interface SkillMatch {
  match_score: number;
  matched_skills: Skill[];
  missing_skills: Skill[];
}

export interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  source: string;
  description: string;
  url: string | null;
  skills: Skill[];
  isSaved: boolean;
  scrapedAt: string;
}