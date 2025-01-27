import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Appointment, User } from '../types';

interface AppointmentWithDetails extends Appointment {
  patients: {
    name: string;
    room_number: string;
    ward: string;
    hospitals: {
      name: string;
    };
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) throw new Error('Not authenticated');

        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (userError) throw userError;
        setUser(userData);

        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            patients (
              name,
              room_number,
              ward,
              hospitals (
                name
              )
            )
          `)
          .eq('user_id', authUser.id)
          .order('appointment_date', { ascending: true });

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData);
      } catch (error: any) {
        toast.error('Error loading profile data');
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/');
      toast.success('Account deleted successfully');
    } catch (error: any) {
      toast.error('Error deleting account');
      console.error('Error:', error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/hospitals')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Hospitals
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5 mr-1" />
            Delete Account
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
            {user && (
              <div className="space-y-2">
                <p className="text-gray-600">Name: {user.full_name}</p>
                <p className="text-gray-600">Email: {user.email}</p>
                <p className="text-gray-600">ID Type: {user.id_type}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No appointments found</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.patients.hospitals.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Patient: {appointment.patients.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Room: {appointment.patients.room_number}, Ward: {appointment.patients.ward}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(appointment.appointment_date), 'PPp')}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Visit Type: {appointment.visit_type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}