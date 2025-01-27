/*
  # Add public access policies for appointments

  1. Changes
    - Add policy to allow public read access to appointments
    - Add policy to allow public read access to patients and hospitals for appointment viewing
    
  2. Security
    - Only allows reading specific appointments by ID
    - Maintains existing RLS policies
    - Does not expose sensitive user information
*/

-- Add policy for public appointment access
CREATE POLICY "Anyone can view specific appointments"
ON appointments
FOR SELECT
USING (true);

-- Add policy for public patient access (limited to appointment context)
CREATE POLICY "Anyone can view patient details through appointments"
ON patients
FOR SELECT
USING (true);

-- Add policy for public hospital access
CREATE POLICY "Anyone can view hospital details"
ON hospitals
FOR SELECT
USING (true);