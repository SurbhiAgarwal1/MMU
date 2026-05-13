// ─── Patient ────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: Address;
  bloodGroup?: BloodGroup;
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// ─── Vitals ─────────────────────────────────────────────────────────────────
export interface VitalSigns {
  id?: string;
  patientId: string;
  visitId: string;
  temperature?: number;         // °C
  temperatureUnit?: 'C' | 'F';
  pulseRate?: number;           // bpm
  respiratoryRate?: number;     // breaths/min
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  spo2?: number;                // %
  weight?: number;              // kg
  height?: number;              // cm
  bmi?: number;
  painScale?: number;           // 0–10
  recordedBy: string;
  recordedAt: string;
}

// ─── Consultation ────────────────────────────────────────────────────────────
export interface Consultation {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  history?: string;
  examination?: string;
  diagnosis: Diagnosis[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  followUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Diagnosis {
  icdCode: string;
  description: string;
  type: 'primary' | 'secondary';
}

// ─── Prescription ────────────────────────────────────────────────────────────
export interface Prescription {
  id?: string;
  consultationId?: string;
  patientId: string;
  doctorId: string;
  medicines: PrescriptionItem[];
  instructions?: string;
  prescribedAt: string;
  dispensedAt?: string;
  status: 'pending' | 'dispensed' | 'cancelled';
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

// ─── Lab ─────────────────────────────────────────────────────────────────────
export interface LabOrder {
  id?: string;
  consultationId?: string;
  patientId: string;
  tests: LabTest[];
  priority: 'routine' | 'urgent' | 'stat';
  orderedBy: string;
  orderedAt: string;
  status: 'ordered' | 'collected' | 'processing' | 'resulted' | 'cancelled';
  results?: LabResult[];
}

export interface LabTest {
  testId: string;
  testName: string;
  category: string;
}

export interface LabResult {
  testId: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  resultedAt: string;
}

// ─── Visit ───────────────────────────────────────────────────────────────────
export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  visitType: 'opd' | 'ipd' | 'emergency' | 'followup';
  status: 'registered' | 'with_nurse' | 'waiting_doctor' | 'with_doctor' | 'completed' | 'cancelled';
  tokenNumber: string;
  department?: string;
  doctorId?: string;
}

// ─── User / Auth ─────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'pharmacist' | 'lab_technician' | 'receptionist';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
  departmentId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}
