export type UserRole = 'vice_doyen' | 'admin' | 'chef_departement' | 'etudiant' | 'professeur';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  formationId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Formation {
  id: string;
  name: string;
  departmentId: string;
  nbModules: number;
}

export interface Module {
  id: string;
  name: string;
  code: string;
  credits: number;
  formationId: string;
  preReqId?: string;
}

export interface LieuExamen {
  id: string;
  name: string;
  capacity: number;
  type: 'amphi' | 'salle';
  building: string;
}

export interface Professor {
  id: string;
  name: string;
  departmentId: string;
  specialty: string;
}

export interface Student {
  id: string;
  name: string;
  firstName: string;
  formationId: string;
  promo: string;
}

export interface Exam {
  id: string;
  moduleId: string;
  moduleName: string;
  professorId: string;
  professorName: string;
  salleId: string;
  salleName: string;
  dateTime: Date;
  duration: number; // in minutes
  department: string;
  formation: string;
}

export interface Conflict {
  id: string;
  type: 'student' | 'professor' | 'room';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedExams: string[];
  department: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalExams: number;
  totalConflicts: number;
  roomOccupancy: number;
  avgExamsPerDay: number;
  departmentsCount: number;
}
