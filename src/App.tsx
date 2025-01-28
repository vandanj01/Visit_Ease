import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Auth from './pages/Auth';
import Hospitals from './pages/Hospitals';
import Appointment from './pages/Appointment';
import Confirmation from './pages/Confirmation';
import Profile from './pages/Profile';
import PublicAppointment from './pages/PublicAppointment';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/appointment/view/:appointmentId" element={<PublicAppointment />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/appointment/:hospitalId" element={<Appointment />} />
            <Route path="/confirmation/:appointmentId" element={<Confirmation />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}

export default App;
