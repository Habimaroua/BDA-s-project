import { Department, Formation, Exam, Conflict, DashboardStats, LieuExamen } from '@/types';

export const departments: Department[] = [
  { id: '1', name: 'Informatique', code: 'INFO' },
  { id: '2', name: 'Mathématiques', code: 'MATH' },
  { id: '3', name: 'Physique', code: 'PHYS' },
  { id: '4', name: 'Chimie', code: 'CHIM' },
  { id: '5', name: 'Biologie', code: 'BIO' },
  { id: '6', name: 'Géologie', code: 'GEO' },
  { id: '7', name: 'Économie', code: 'ECO' },
];

export const formations: Formation[] = [
  { id: '1', name: 'Licence Informatique', departmentId: '1', nbModules: 8 },
  { id: '2', name: 'Master Intelligence Artificielle', departmentId: '1', nbModules: 6 },
  { id: '3', name: 'Licence Mathématiques', departmentId: '2', nbModules: 7 },
  { id: '4', name: 'Master Data Science', departmentId: '2', nbModules: 6 },
  { id: '5', name: 'Licence Physique', departmentId: '3', nbModules: 8 },
];

export const rooms: LieuExamen[] = [
  { id: '1', name: 'Amphi A', capacity: 300, type: 'amphi', building: 'Bâtiment Principal' },
  { id: '2', name: 'Amphi B', capacity: 250, type: 'amphi', building: 'Bâtiment Principal' },
  { id: '3', name: 'Amphi C', capacity: 200, type: 'amphi', building: 'Bâtiment Sciences' },
  { id: '4', name: 'Salle 101', capacity: 20, type: 'salle', building: 'Bâtiment A' },
  { id: '5', name: 'Salle 102', capacity: 20, type: 'salle', building: 'Bâtiment A' },
  { id: '6', name: 'Salle 201', capacity: 20, type: 'salle', building: 'Bâtiment B' },
];

export const exams: Exam[] = [
  {
    id: '1',
    moduleId: 'm1',
    moduleName: 'Algorithmique Avancée',
    professorId: 'p1',
    professorName: 'Dr. Ahmed Benali',
    salleId: '1',
    salleName: 'Amphi A',
    dateTime: new Date('2025-01-15T08:00:00'),
    duration: 120,
    department: 'Informatique',
    formation: 'Licence Informatique',
  },
  {
    id: '2',
    moduleId: 'm2',
    moduleName: 'Base de Données',
    professorId: 'p2',
    professorName: 'Dr. Sara Mansouri',
    salleId: '2',
    salleName: 'Amphi B',
    dateTime: new Date('2025-01-15T14:00:00'),
    duration: 90,
    department: 'Informatique',
    formation: 'Licence Informatique',
  },
  {
    id: '3',
    moduleId: 'm3',
    moduleName: 'Analyse Mathématique',
    professorId: 'p3',
    professorName: 'Dr. Mohamed Tazi',
    salleId: '3',
    salleName: 'Amphi C',
    dateTime: new Date('2025-01-16T08:00:00'),
    duration: 180,
    department: 'Mathématiques',
    formation: 'Licence Mathématiques',
  },
  {
    id: '4',
    moduleId: 'm4',
    moduleName: 'Intelligence Artificielle',
    professorId: 'p4',
    professorName: 'Dr. Fatima Zahra',
    salleId: '1',
    salleName: 'Amphi A',
    dateTime: new Date('2025-01-16T14:00:00'),
    duration: 120,
    department: 'Informatique',
    formation: 'Master Intelligence Artificielle',
  },
  {
    id: '5',
    moduleId: 'm5',
    moduleName: 'Physique Quantique',
    professorId: 'p5',
    professorName: 'Dr. Hassan Alami',
    salleId: '2',
    salleName: 'Amphi B',
    dateTime: new Date('2025-01-17T08:00:00'),
    duration: 150,
    department: 'Physique',
    formation: 'Licence Physique',
  },
];

export const conflicts: Conflict[] = [
  {
    id: '1',
    type: 'student',
    severity: 'high',
    description: '15 étudiants ont 2 examens programmés le même jour',
    affectedExams: ['1', '2'],
    department: 'Informatique',
  },
  {
    id: '2',
    type: 'room',
    severity: 'medium',
    description: 'Amphi A surchargé de 25 places',
    affectedExams: ['1'],
    department: 'Informatique',
  },
  {
    id: '3',
    type: 'professor',
    severity: 'low',
    description: 'Dr. Ahmed a 4 surveillances prévues ce jour',
    affectedExams: ['1', '4'],
    department: 'Informatique',
  },
];

export const dashboardStats: DashboardStats = {
  totalStudents: 13245,
  totalExams: 847,
  totalConflicts: 23,
  roomOccupancy: 78.5,
  avgExamsPerDay: 42,
  departmentsCount: 7,
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    'vice_doyen': 'Vice-Doyen',
    'admin': 'Administrateur',
    'chef_departement': 'Chef de Département',
    'etudiant': 'Étudiant',
    'professeur': 'Professeur',
  };
  return labels[role] || role;
};

export const getRoleDescription = (role: string): string => {
  const descriptions: Record<string, string> = {
    'vice_doyen': 'Vue stratégique globale et validation finale',
    'admin': 'Génération EDT et gestion des conflits',
    'chef_departement': 'Validation et statistiques par département',
    'etudiant': 'Consultation du planning personnalisé',
    'professeur': 'Consultation du planning et surveillances',
  };
  return descriptions[role] || '';
};
