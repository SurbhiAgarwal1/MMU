// ─── Patient ──────────────────────────────────────────────
export interface Patient {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  phone: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string[];
  createdAt: string;
}

export interface PatientRegistration {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  phone: string;
  address: string;
  bloodGroup: string;
}

// ─── Vitals ──────────────────────────────────────────────
export interface VitalSigns {
  id?: string;
  patientId: string;
  bp: string;           // e.g. "120/80"
  pulse: number;
  temperature: number;
  weight: number;
  height: number;
  spo2: number;
  recordedBy?: string;
  recordedAt?: string;
}

// ─── Consultation ─────────────────────────────────────────
export interface Diagnosis {
  code: string;   // ICD-10
  name: string;
}

export interface Prescription {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Consultation {
  id?: string;
  patientId: string;
  chiefComplaint: string;
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  labOrders: string[];
  notes?: string;
  doctorId?: string;
  consultedAt?: string;
}

// ─── Auth ─────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'pharmacist' | 'lab';
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ─── API ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
