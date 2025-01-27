/*
  # Initial Schema Setup for Hospital Visitor Scheduler

  1. New Tables
    - users
      - id (uuid, primary key)
      - phone (text, unique)
      - full_name (text)
      - id_type (text)
      - id_document_url (text)
      - created_at (timestamp)
    
    - hospitals
      - id (uuid, primary key)
      - name (text)
      - address (text)
      - created_at (timestamp)
    
    - patients
      - id (uuid, primary key)
      - hospital_id (uuid, foreign key)
      - name (text)
      - room_number (text)
      - ward (text)
      - patient_id (text, unique)
      - created_at (timestamp)
    
    - appointments
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - patient_id (uuid, foreign key)
      - relationship (text)
      - visit_type (text)
      - visitor_count (integer)
      - appointment_date (timestamp)
      - status (text)
      - qr_code (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    id_type TEXT,
    id_document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospitals Table
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id),
    name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    ward TEXT NOT NULL,
    patient_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    patient_id UUID REFERENCES patients(id),
    relationship TEXT NOT NULL,
    visit_type TEXT NOT NULL,
    visitor_count INTEGER NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Public can read hospitals" ON hospitals
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Public can read patients" ON patients
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own appointments" ON appointments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);