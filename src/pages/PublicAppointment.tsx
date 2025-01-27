import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Users, VideoIcon, UserRound, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Appointment, Patient, Hospital } from '../types';

interface AppointmentDetails extends Appointment {
  patients: Patient;
  patients: {
    hospitals: Hospital;
  };
}

export default function PublicAppointment() {
  const { appointmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // Create an anonymous session for public access
        const { data: { session }, error: anonError } = await supabase.auth.signInWithPassword({
          email: 'anonymous@example.com',
          password: 'anonymous',
        });

        if (anonError) {
          // If anonymous login fails, proceed without authentication
          console.warn('Anonymous login failed, proceeding without auth');
        }

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patients (
              *,
              hospitals (*)
            )
          `)
          .eq('id', appointmentId)
          .single();

        if (error) throw error;
        setAppointment(data);

        // Sign out the anonymous session
        if (session) {
          await supabase.auth.signOut();
        }
      } catch (error: any) {
        console.error('Error fetching appointment:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Appointment Not Found
          </h1>
          <p className="text-gray-600">
            The appointment you're looking for might have been cancelled or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Hospital Visit Details
            </h1>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Hospital Details</h3>
                <p className="text-gray-600">{appointment.patients.hospitals.name}</p>
                <p className="text-gray-600">{appointment.patients.hospitals.address}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Patient Details</h3>
                <p className="text-gray-600">Room: {appointment.patients.room_number}</p>
                <p className="text-gray-600">Ward: {appointment.patients.ward}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {format(new Date(appointment.appointment_date), 'PPpp')}
                  </span>
                </div>

                <div className="flex items-center">
                  {appointment.visit_type === 'in-person' ? (
                    <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                  ) : (
                    <VideoIcon className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-gray-600">
                    {appointment.visit_type === 'in-person' ? 'In-person Visit' : 'Online Visit'}
                  </span>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {appointment.visitor_count} {appointment.visitor_count === 1 ? 'Visitor' : 'Visitors'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <p className="text-sm text-gray-500 text-center">
              Please present this to the hospital staff upon arrival
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}