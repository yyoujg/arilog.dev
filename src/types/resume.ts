export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export interface Resume {
  name: string;
  title: string;
  summary: string;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
}
