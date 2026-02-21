import { useState, useEffect } from 'react';
import type { User, AttendanceRecord, AttendanceSession } from '../App';
import { CheckCircle, Clock, LogOut, AlertCircle, Wifi, Lock, WifiOff } from 'lucide-react';

interface StudentAttendanceProps {
  user: User;
  onLogout: () => void;
}

export function StudentAttendance({ user, onLogout }: StudentAttendanceProps) {
  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [error, setError] = useState('');
  const [isConnectedToNetwork, setIsConnectedToNetwork] = useState(true);

  useEffect(() => {
    // Check if student has already marked attendance for current session
    checkAttendanceStatus();
    checkSessionStatus();
  }, [user.id]);

  // Poll for session status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkSessionStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkAttendanceStatus = () => {
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]') as AttendanceRecord[];
    const session = localStorage.getItem('activeAttendanceSession');
    
    if (session) {
      const parsedSession: AttendanceSession = JSON.parse(session);
      const sessionRecord = attendanceRecords.find(
        record => 
          record.studentId === user.id && 
          record.sessionCode === parsedSession.sessionCode &&
          parsedSession.isActive
      );
      
      if (sessionRecord) {
        setHasMarkedAttendance(true);
        setAttendanceTime(sessionRecord.timestamp);
      }
    }
  };

  const checkSessionStatus = () => {
    const session = localStorage.getItem('activeAttendanceSession');
    if (session) {
      const parsedSession: AttendanceSession = JSON.parse(session);
      setActiveSession(parsedSession);
      setSessionActive(parsedSession.isActive);
      
      // Reset attendance status if session changed
      if (parsedSession.isActive) {
        checkAttendanceStatus();
      }
    } else {
      setSessionActive(false);
      setActiveSession(null);
    }
  };

  const markAttendance = () => {
    setError('');

    if (!isConnectedToNetwork) {
      setError('Network connection required. Please connect to the classroom network.');
      return;
    }

    if (!sessionActive || !activeSession) {
      setError('No active attendance session. Please wait for your lecturer to start the session.');
      return;
    }

    if (sessionCode.trim().toUpperCase() !== activeSession.sessionCode) {
      setError('Invalid session code. Please check the code displayed by your lecturer.');
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const date = now.toLocaleDateString();

    const newRecord: AttendanceRecord = {
      studentId: user.id,
      studentName: user.name,
      timestamp,
      date,
      sessionCode: activeSession.sessionCode
    };

    const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]') as AttendanceRecord[];
    existingRecords.push(newRecord);
    localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));

    setHasMarkedAttendance(true);
    setAttendanceTime(timestamp);
    setSessionCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h1>
              <p className="text-gray-600">Student Attendance Portal</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Network Connection Status */}
          {isConnectedToNetwork ? (
            <div className="mb-6 bg-green-50 border border-green-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Connected to Classroom Network</p>
                    <p className="text-xs text-green-600">Private network • Physical classroom only</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConnectedToNetwork(false)}
                  className="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors"
                >
                  Disconnect (Demo)
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <WifiOff className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Not Connected to Classroom Network</p>
                    <p className="text-xs text-red-600">You must connect to mark attendance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConnectedToNetwork(true)}
                  className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                >
                  Connect (Demo)
                </button>
              </div>
              <div className="bg-red-100 rounded-lg p-4 mt-3">
                <p className="text-sm font-medium text-red-900 mb-2">⚠️ Network Connection Required</p>
                <p className="text-xs text-red-800 mb-3">
                  To mark your attendance, you must be physically present in the classroom and connected to the lecturer's private network.
                </p>
                <div className="text-xs text-red-700 space-y-1">
                  <p><strong>How to connect:</strong></p>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>Open your device's WiFi settings</li>
                    <li>Look for the classroom network name</li>
                    <li>Enter the network password (provided by lecturer)</li>
                    <li>Wait for connection confirmation</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Session Status Indicator */}
          <div className="mb-6">
            {sessionActive && activeSession ? (
              <div className="bg-green-50 border border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-medium">Attendance session is active</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Hosted by {activeSession.lecturerName} • Started at {activeSession.startTime}</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-500 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-amber-800 font-medium">No active session</p>
                  <p className="text-sm text-amber-700">Waiting for lecturer to start attendance...</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center py-12">
            {!hasMarkedAttendance ? (
              <>
                <Clock className="w-24 h-24 mx-auto mb-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Mark Your Attendance
                </h2>
                <p className="text-gray-600 mb-8">
                  Enter the session code displayed by your lecturer to confirm your physical presence
                </p>

                {/* Session Code Input */}
                <div className="max-w-sm mx-auto mb-6">
                  <label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Session Access Code
                  </label>
                  <input
                    type="text"
                    id="sessionCode"
                    value={sessionCode}
                    onChange={(e) => {
                      setSessionCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-2xl font-mono text-center tracking-widest uppercase"
                    disabled={!sessionActive}
                  />
                  {error && (
                    <p className="text-red-600 text-sm mt-2 text-left">{error}</p>
                  )}
                </div>

                <button
                  onClick={markAttendance}
                  disabled={!sessionActive || sessionCode.length !== 6}
                  className="px-12 py-6 bg-indigo-600 text-white rounded-xl font-medium text-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Verify & Mark Present
                </button>
                
                {!sessionActive ? (
                  <p className="text-sm text-gray-500 mt-4">
                    Button will be enabled when lecturer starts the session
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-4">
                    Get the code from your lecturer's screen
                  </p>
                )}

                {/* Security Notice */}
                <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-left">
                  <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-indigo-900 mb-1">Security Notice</p>
                      <p className="text-xs text-indigo-700">
                        This system verifies your physical presence in the classroom. The session code changes with each class and can only be obtained from the lecturer's display.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Attendance Confirmed!
                </h2>
                <p className="text-gray-600 mb-2">
                  You marked your attendance at
                </p>
                <p className="text-xl font-semibold text-indigo-600 mb-8">
                  {attendanceTime}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 inline-block">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">
                      You're all set for today's class
                    </p>
                  </div>
                  {activeSession && (
                    <p className="text-sm text-green-700">
                      Session: {activeSession.sessionCode} • Verified with {activeSession.lecturerName}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-4 text-center text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
}