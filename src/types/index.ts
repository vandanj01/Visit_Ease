export interface User {
  id: string;
  email: string;
  full_name: string;
  id_type?: string;
  id_document_url?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
}

export interface Patient {
  id: string;
  hospital_id: string;
  name: string;
  room_number: string;
  ward: string;
  patient_id: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  relationship: string;
  visit_type: 'online' | 'in-person';
  visitor_count: number;
  appointment_date: string;
  status: 'pending' | 'approved' | 'rejected';
  qr_code?: string;
}