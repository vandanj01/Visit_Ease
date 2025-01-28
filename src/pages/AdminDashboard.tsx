import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending'); // Fetch only pending appointments

      if (error) {
        console.error('Error fetching appointments:', error.message);
      } else {
        setAppointments(data);
      }
    };

    fetchAppointments();
  }, []);

  const handleApproval = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('Error approving appointment:', error.message);
    } else {
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    }
  };

  const handleRejection = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting appointment:', error.message);
    } else {
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Appointment Requests</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Patient Name</th>
            <th className="border px-4 py-2">Appointment Date</th>
            <th className="border px-4 py-2">Visit Type</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="border px-4 py-2">{appointment.patients.name}</td>
              <td className="border px-4 py-2">{new Date(appointment.appointment_date).toLocaleString()}</td>
              <td className="border px-4 py-2">{appointment.visit_type}</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleApproval(appointment.id)} className="text-green-600">Approve</button>
                <button onClick={() => handleRejection(appointment.id)} className="text-red-600 ml-2">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
