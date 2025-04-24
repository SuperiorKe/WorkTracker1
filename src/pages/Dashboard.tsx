import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, Image as ImageIcon, Loader2, Bell } from 'lucide-react';

interface WorkLog {
  id: string;
  description: string;
  image_url: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWorkLogs();
    fetchNotificationPreferences();
  }, []);

  async function fetchNotificationPreferences() {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('sms_enabled')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setSmsEnabled(data?.sms_enabled || false);

      // Modified query to handle the case where no user is found
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', user?.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setPhoneNumber('');
        return;
      }

      setPhoneNumber(userData?.phone_number || '');
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      setPhoneNumber('');
      setSmsEnabled(false);
    }
  }

  async function toggleSmsNotifications() {
    try {
      // First check if a record exists
      const { data: existingPrefs, error: checkError } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      let error;
      if (existingPrefs) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('notification_preferences')
          .update({ sms_enabled: !smsEnabled })
          .eq('user_id', user?.id);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert([{
            user_id: user?.id,
            sms_enabled: !smsEnabled
          }]);
        error = insertError;
      }

      if (error) throw error;
      setSmsEnabled(!smsEnabled);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  async function fetchWorkLogs() {
    try {
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching work logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !description.trim()) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('work-logs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('work-logs')
        .getPublicUrl(filePath);

      // Create work log
      const { error: insertError } = await supabase
        .from('work_logs')
        .insert([
          {
            user_id: user?.id,
            description,
            image_url: publicUrl,
          },
        ]);

      if (insertError) throw insertError;

      // Send SMS notification if enabled
      let smsError = null;
      if (smsEnabled && phoneNumber) {
        try {
          const { error } = await supabase.functions.invoke('send-sms', {
            body: {
              phone: phoneNumber,
              message: `New work log added: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`
            }
          });
          smsError = error;
        } catch (error) {
          console.error('SMS invocation error:', error);
          smsError = error;
        }

        if (smsError) {
          console.error('Error sending SMS notification:', smsError);
          // Show error toast or alert here if you want to notify the user
          alert(`Failed to send SMS notification: ${smsError.message || 'Unknown error'}`);
        }
      }

      // Reset form and refresh logs
      setDescription('');
      setFile(null);
      fetchWorkLogs();
    } catch (error) {
      console.error('Error creating work log:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Work Logger</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  pattern="^\+[1-9]\d{1,14}$"
                  title="Phone number in international format (e.g., +1234567890)"
                />
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('users')
                        .update({ phone_number: phoneNumber })
                        .eq('id', user?.id);
                      
                      if (error) throw error;
                    } catch (error) {
                      console.error('Error updating phone number:', error);
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                >
                  Save
                </button>
              </div>
              <button
                onClick={toggleSmsNotifications}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none transition ${
                  smsEnabled 
                    ? 'text-green-700 bg-green-100 hover:bg-green-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={smsEnabled ? 'SMS notifications enabled' : 'SMS notifications disabled'}
              >
                <Bell className={`h-4 w-4 mr-2 ${smsEnabled ? 'text-green-600' : ''}`} />
                SMS
              </button>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="What did you work on today?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {file ? file.name : 'PNG, JPG, GIF up to 10MB'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file || !description.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Work Log
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={log.image_url}
                      alt="Work log"
                      className="object-cover w-full h-48"
                    />
                  </div>
                  <div className="px-4 py-4">
                    <p className="text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-900">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}