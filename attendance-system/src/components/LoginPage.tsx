import { useState } from 'react';
import type { UserRole } from '../App';
import { UserCircle, GraduationCap, Wifi } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string, role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedRole) {
      onLogin(name.trim(), selectedRole);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6 bg-green-50 border border-green-500 rounded-lg p-4 flex items-center gap-3">
          <Wifi className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Connected to Classroom Network</p>
            <p className="text-xs text-green-600">Private attendance network active</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Classroom Attendance</h1>
          <p className="text-gray-600">Private Network • Physical Classroom Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedRole === 'student'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <GraduationCap className="w-12 h-12 mx-auto mb-2 text-indigo-600" />
                <div className="font-medium text-gray-800">Student</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('lecturer')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedRole === 'lecturer'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <UserCircle className="w-12 h-12 mx-auto mb-2 text-indigo-600" />
                <div className="font-medium text-gray-800">Lecturer</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !selectedRole}
            className="w-full py-4 bg-indigo-600 text-white rounded-lg font-medium text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}