import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Hospital } from '../types';

export default function Hospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setHospitals(data || []);
      } catch (error: any) {
        console.error('Error fetching hospitals:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Select a Hospital
          </h1>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <UserCircle className="h-6 w-6" />
            <span>Profile</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital) => (
            <button
              key={hospital.id}
              onClick={() => navigate(`/appointment/${hospital.id}`)}
              className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {hospital.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {hospital.address}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {hospitals.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No hospitals found. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
}