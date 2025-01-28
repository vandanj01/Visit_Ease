import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { CheckCircle2, Calendar, Users, VideoIcon, UserRound, Loader2, ArrowLeft, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Appointment, Patient, Hospital } from '../types';

interface AppointmentDetails extends Appointment {
  patients: Patient;
  patients: {
    hospitals: Hospital;
  };
}

export default function Confirmation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const qrCodeRef = React.useRef<HTMLDivElement>(null); // Reference for the QR code

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
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
      } catch (error: any) {
        console.error('Error fetching appointment:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const downloadQRCode = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `appointment-${appointmentId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Appointment not found</p>
      </div>
    );
  }

  const publicAppointmentUrl = `${window.location.origin}/appointment/view/${appointmentId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/hospitals')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Hospitals
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointment Request Processed!
          </h1>
          <p className="text-gray-600">
            Your visit request has been processed successfully! Wait for confirmation email to confirm your appointment!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <QRCodeSVG
                value={publicAppointmentUrl}
                size={160}
                level="H"
                includeMargin
              />
              <button
                onClick={downloadQRCode}
                className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
              >
                <Download className="h-5 w-5 mr-1" />
                Download QR Code
              </button>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Anyone can scan this QR code to view the appointment details
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Hospital Details</h3>
                <p className="text-gray-600">{appointment.patients.hospitals.name}</p>
                <p className="text-gray-600">{appointment.patients.hospitals.address}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Patient Details</h3>
                <p className="text-gray-600">Name: {appointment.patients.name}</p>
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
              Please show this QR code to the hospital staff upon arrival
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
