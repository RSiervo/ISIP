export type IdeaStatus = 'Review' | 'Pilot' | 'Implemented' | 'Deferred';
export type ComplexityLevel = 'Low (quick win)' | 'Medium' | 'High / requires further study';

export interface Idea {
  id: string;
  referenceId: string;
  timestamp: string;
  
  // Section 1: About You
  name: string;
  isAnonymous: boolean;
  department: string;
  role: string;
  canContact: boolean;
  
  // Section 2: Your Idea
  title: string;
  category: string;
  description: string;
  
  // Section 3: Impact & Value
  painPoint: string;
  impactTags: string[];
  beneficiaries: string;
  
  // Section 4: Feasibility
  complexity: ComplexityLevel;
  seenElsewhere: boolean;
  seenElsewhereDetail?: string;
  additionalThoughts?: string;
  
  // Internal Admin Fields
  status: IdeaStatus;
  impactScore: number; // 1-10
  feasibilityScore: number; // 1-10
  owner: string;
  internalNotes: string;
  lastUpdated: string;
  isRead?: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string; // Plain text for demo simplicity
  name: string;
  role: string;
  lastLogin: string;
}

export interface CompanyQuestion {
  id: string;
  text: string;
  timestamp: string;
  isActive: boolean;
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  name: string;
  answer: string;
  timestamp: string;
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN'
}

export type AppView = 'LANDING' | 'SUBMISSION' | 'ADMIN' | 'USER_MANAGEMENT' | 'TRACKING';