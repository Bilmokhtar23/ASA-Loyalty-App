import { useAuth } from '../context/AuthContext';
import { User, Mail, School, Hash, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-bold text-2xl">
          {user.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        <div className="p-4 flex items-center gap-4">
          <School className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">University</p>
            <p className="text-gray-900">{user.university || 'Not specified'}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4">
          <Hash className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Student ID</p>
            <p className="text-gray-900">{user.student_id || 'Not specified'}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Member Since</p>
            <p className="text-gray-900">March 2024</p>
          </div>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
      
      <div className="text-center text-xs text-gray-400">
        App Version 1.0.0
      </div>
    </div>
  );
}
