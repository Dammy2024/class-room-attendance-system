import { useState, useEffect } from 'react';
import type { User, AttendanceRecord, AttendanceSession } from '../App';
import { Users, Calendar, LogOut, Trash2, Play, Square, Download, Wifi, Copy, Check } from 'lucide-react';

interface LecturerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function LecturerDashboard({ user, onLogout }: LecturerDashboardProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString());
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAttendanceRecords();
    loadActiveSession();
  }, []);

  useEffect(() => {
    if (activeSession?.isActive) {
      const interval = setInterval(() => {
        loadAttendanceRecords();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeSession?.isActive]);

  const loadAttendanceRecords = () => {
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]') as AttendanceRecord[];
    setAttendanceRecords(records);
  };

  const loadActiveSession = () => {
    const session = localStorage.getItem('activeAttendanceSession');
    if (session) {
      setActiveSession(JSON.parse(session));
    }
  };

  const generateSessionCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const startAttendanceSession = () => {
    const now = new Date();
    const session: AttendanceSession = {
      isActive: true,
      startTime: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      sessionCode: generateSessionCode(),
      lecturerName: user.name
    };
    localStorage.setItem('activeAttendanceSession', JSON.stringify(session));
    setActiveSession(session);
    setSelectedDate(session.date);
  };

  const endAttendanceSession = () => {
    if (activeSession) {
      const endedSession: AttendanceSession = {
        ...activeSession,
        isActive: false
      };
      localStorage.setItem('activeAttendanceSession', JSON.stringify(endedSession));
      setActiveSession(endedSession);
    }
  };

  const copySessionCode = () => {
    if (activeSession?.sessionCode) {
      try {
        navigator.clipboard.writeText(activeSession.sessionCode).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = activeSession.sessionCode;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            alert(`Session Code: ${activeSession.sessionCode}`);
          }
          document.body.removeChild(textArea);
        });
      } catch (err) {
        alert(`Session Code: ${activeSession.sessionCode}`);
      }
    }
  };

  const exportToCSV = () => {
    const records = attendanceRecords.filter(record => record.date === selectedDate);
    
    if (records.length === 0) {
      alert('No records to export for this date');
      return;
    }

    const csvContent = [
      ['Student Name', 'Student ID', 'Time', 'Date', 'Session Code'].join(','),
      ...records.map(record => 
        [record.studentName, record.studentId, record.timestamp, record.date, record.sessionCode || 'N/A'].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate.replace(/\//g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const todayRecords = attendanceRecords.filter(record => record.date === selectedDate);
  const liveSessionRecords = activeSession?.isActive 
    ? attendanceRecords.filter(record => 
        record.date === activeSession.date && 
        record.sessionCode === activeSession.sessionCode
      )
    : [];

  const uniqueDates = Array.from(new Set(attendanceRecords.map(record => record.date))).sort().reverse();

  const clearAllRecords = () => {
    if (window.confirm('Are you sure you want to clear all attendance records?')) {
      localStorage.setItem('attendanceRecords', '[]');
      setAttendanceRecords([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 animate-fade-in">
      <div className="max-w-5xl mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Lecturer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wifi className="w-6 h-6 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">Private Classroom Network</h3>
            </div>
            <p className="text-sm text-gray-600">
              This attendance system operates on a secure, local network. Only students physically present in the classroom and connected to your network can mark attendance.
            </p>
          </div>

          <div className="mb-8">
            {!activeSession?.isActive ? (
              <button
                onClick={startAttendanceSession}
                className="w-full py-6 bg-green-600 text-white rounded-xl font-medium text-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Play className="w-8 h-8" />
                Start Attendance Session
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">Session Active</p>
                        <p className="text-sm text-gray-600">Started at {activeSession.startTime}</p>
                      </div>
                    </div>
                    <button
                      onClick={endAttendanceSession}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Square className="w-5 h-5" />
                      End Session
                    </button>
                  </div>

                  <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Session Access Code:</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-green-700 tracking-wider font-mono">
                          {activeSession.sessionCode}
                        </span>
                      </div>
                      <button
                        onClick={copySessionCode}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Students must enter this code to verify they're in the classroom
                    </p>
                  </div>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Live Attendance ({liveSessionRecords.length} students)
                    </h3>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Updates automatically
                    </div>
                  </div>
                  
                  {liveSessionRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Waiting for students to mark attendance...</p>
                      <p className="text-sm mt-2">Share the session code: <span className="font-bold text-green-600">{activeSession.sessionCode}</span></p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {liveSessionRecords.map((record, index) => (
                        <div
                          key={index}
                          className="bg-green-50 p-4 rounded-lg flex justify-between items-center border border-green-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-white">
                                {record.studentName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{record.studentName}</p>
                              <p className="text-sm text-gray-500">ID: {record.studentId.slice(-8)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">{record.timestamp}</p>
                            <p className="text-sm text-green-600 font-semibold">✓ Verified</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Historical Records</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-indigo-50 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-3 rounded-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Selected Date</p>
                    <p className="text-3xl font-bold text-gray-800">{todayRecords.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-3xl font-bold text-gray-800">{attendanceRecords.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="flex flex-wrap gap-4">
                <select
                  id="dateFilter"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
                >
                  {uniqueDates.length > 0 ? (
                    uniqueDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))
                  ) : (
                    <option value={selectedDate}>{selectedDate}</option>
                  )}
                </select>
                <button
                  onClick={exportToCSV}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
                <button
                  onClick={clearAllRecords}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Attendance for {selectedDate}
              </h3>
              
              {todayRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No attendance records for this date</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayRecords.map((record, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-indigo-600">
                            {record.studentName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{record.studentName}</p>
                          <p className="text-sm text-gray-500">
                            ID: {record.studentId.slice(-8)}
                            {record.sessionCode && ` • Code: ${record.sessionCode}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{record.timestamp}</p>
                        <p className="text-sm text-green-600">✓ Present</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}