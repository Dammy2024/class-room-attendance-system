import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { StudentAttendance } from './components/StudentAttendance';
import { LecturerDashboard } from './components/LecturerDashboard';

export type UserRole = 'student' | 'lecturer' | null;

export interface User {
  name: string;
  role: UserRole;
  id: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  timestamp: string;
  date: string;
  sessionCode?: string;
}

export interface AttendanceSession {
  isActive: boolean;
  startTime: string | null;
  date: string;
  sessionCode: string;
  lecturerName: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (name: string, role: UserRole) => {
    const newUser: User = {
      name,
      role,
      id: `${role}-${Date.now()}`
    };
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === 'student') {
    return <StudentAttendance user={user} onLogout={handleLogout} />;
  }

  if (user.role === 'lecturer') {
    return <LecturerDashboard user={user} onLogout={handleLogout} />;
  }

  return null;
}
