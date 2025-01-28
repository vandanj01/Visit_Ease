import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, VideoIcon, UserRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Patient, Hospital } from '../types';

export default function Appointment() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    relationship: '',
    visitType: 'in-person',
    visitorCount: 1,
    appointmentDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', hospitalId)
          .single();
        
        if (error) throw error;
        setHospital(data);
      } catch (error: any) {
        toast.error('Error fetching hospital details');
        navigate('/hospitals');
      }
    };

    fetchHospital();
  }, [hospitalId, navigate]);

  const handlePatientSearch = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('hospital_id', hospitalId)
        .eq('patient_id', formData.patientId)
        .single();
      
      if (error) throw error;
      setPatient(data);
      toast.success('Patient found');
    } catch (error) {
      toast.error('Invalid patient ID');
      setPatient(null);
    }
  };

  const generateTimeSlots = (date: Date) => {
    const slots = [];
    const startHour = 9; // Example start hour (9 AM)
    const endHour = 17; // Example end hour (5 PM)

    for (let hour = startHour; hour <= endHour; hour++) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0); // Set to the start of the hour
      slots.push(slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    return slots;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    setFormData({ ...formData, appointmentDate: e.target.value });
    
    // Generate time slots for the selected date
    const generatedSlots = generateTimeSlots(selectedDate);
    setTimeSlots(generatedSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          patient_id: patient.id,
          relationship: formData.relationship,
          visit_type: formData.visitType,
          visitor_count: formData.visitorCount,
          appointment_date: new Date(formData.appointmentDate).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/confirmation/${data.id}`);
    } catch (error: any) {
      toast.error('Error creating appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Book an Appointment
        </h1>
        {hospital && (
          <p className="text-center text-gray-600 mb-8">
            {hospital.name}
          </p>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient ID"
              />
              <button
                type="button"
                onClick={handlePatientSearch}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Verify
              </button>
            </div>
          </div>

          {patient && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Patient Details</h3>
                <p className="text-blue-800">Name: {patient.name}</p>
                <p className="text-blue-800">Room: {patient.room_number}</p>
                <p className="text-blue-800">Ward: {patient.ward}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship with Patient
                </label>
                <input
                  type="text"
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Son, Daughter, Spouse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visitType: 'in-person' })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border ${
                      formData.visitType === 'in-person'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    <UserRound className="h-5 w-5" />
                    <span>In Person</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visitType: 'online' })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border ${
                      formData.visitType === 'online'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    <VideoIcon className="h-5 w-5" />
                    <span>Online</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Visitors
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    required
                    min="1"
                    max="2"
                    value={formData.visitorCount}
                    onChange={(e) => setFormData({ ...formData, visitorCount: parseInt(e.target.value) })}
                    className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
        <label htmlFor="appointmentDate">Appointment Date</label>
        <input
          type="date"
          id="appointmentDate"
          value={formData.appointmentDate}
          onChange={handleDateChange}
          required
        />
      </div>

             <div>
        <label htmlFor="timeSlot">Select Time Slot</label>
        <select
          id="timeSlot"
          value={formData.selectedTimeSlot}
          onChange={(e) => setFormData({ ...formData, selectedTimeSlot: e.target.value })}
          required
        >
          <option value="">-- Select a Time Slot --</option>
          {timeSlots.map((slot, index) => (
            <option key={index} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>
              

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  'Book Appointment'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
