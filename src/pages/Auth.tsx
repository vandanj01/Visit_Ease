import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const ID_TYPES = [
  'National ID',
  'Passport',
  'Driver\'s License',
  'Military ID'
];

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    idType: ID_TYPES[0],
    idDocument: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error('No user returned from sign up');

        const idDocumentPath = formData.idDocument 
          ? `id-documents/${Date.now()}-${formData.idDocument.name}`
          : null;

        if (idDocumentPath && formData.idDocument) {
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(idDocumentPath, formData.idDocument);
          if (uploadError) throw uploadError;
        }

        // Create user profile in the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: signUpData.user.id, // Use the auth user id
            email: formData.email,
            full_name: formData.fullName,
            id_type: formData.idType,
            id_document_url: idDocumentPath,
          });
        if (profileError) throw profileError;

        toast.success('Account created successfully!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
        
        toast.success('Signed in successfully!');
      }

      navigate('/hospitals');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hospital Visit Scheduler
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create an account to continue' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Type
                </label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ID_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      idDocument: e.target.files?.[0] || null 
                    })}
                    className="hidden"
                    id="id-document"
                  />
                  <label
                    htmlFor="id-document"
                    className="flex items-center justify-center w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {formData.idDocument ? formData.idDocument.name : 'Upload ID Document'}
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 mx-auto" />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
          <button onClick={() => navigate('/admin')} className="absolute bottom-4 right-4 text-blue-600 hover:text-blue-700">
  Admin Dashboard
</button>

        </form>
      </div>
    </div>
  );
}
