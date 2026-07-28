// types/dashboard.ts

export interface Stats {
  totalJobs: number;
  totalCompanies: number;
  newToday: number;
  activeJobs: number;
}

export interface SourceDistribution {
  source: string;
  total: number;
  percentage: number;
}

export interface WeeklyTrendItem {
  day: string;
  date: string;
  total: number;
}

export interface GraphData {
  sources: SourceDistribution[];
  weeklyTrend: WeeklyTrendItem[];
}

export interface CompanyModel {
  id: number;
  name: string;
  logo?: string;
  jobs_count: number;
}

export interface SkillModel {
  id: number;
  name: string;
  jobs_count?: number;
}