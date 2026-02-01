import React, { useState } from 'react';
import Scanner from './components/Scanner';
import ParticipantCard from './components/ParticipantCard';
import AdminDashboard from './components/AdminDashboard';
import { fetchParticipant, markAttendance } from './services/api';

function App() {
  const [view, setView] = useState('scanner'); // 'scanner', 'admin'
  const [currentSession, setCurrentSession] = useState('day1_fn');
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Session options updated to FN/AN
  const sessions = [
    { value: 'day1_fn', label: 'Day 1 - Forenoon' },
    { value: 'day1_an', label: 'Day 1 - Afternoon' },
    { value: 'day2_fn', label: 'Day 2 - Forenoon' },
    { value: 'day2_an', label: 'Day 2 - Afternoon' },
    { value: 'day3_fn', label: 'Day 3 - Forenoon' },
    { value: 'day3_an', label: 'Day 3 - Afternoon' },
  ];

  const handleScan = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    setParticipant(null);
    try {
      const res = await fetchParticipant(id);
      setParticipant(res.data);
    } catch (err) {
      console.error(err);
      setError('Participant not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!participant) return;
    setLoading(true);
    try {
      const res = await markAttendance(participant.id, currentSession, 'PRESENT');
      setParticipant(res.data); // Update with new status
      alert(`Success! Marked ${participant.name} as PRESENT for ${currentSession}`);
    } catch (err) {
      console.error(err);
      setError('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">HackOrganizer</h1>
          <nav className="space-x-4">
            <button
              onClick={() => { setView('scanner'); setParticipant(null); setError(''); }}
              className={`px-3 py-1 rounded transition ${view === 'scanner' ? 'bg-white text-blue-800 font-bold' : 'text-blue-100 hover:text-white'}`}
            >
              Scanner
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-3 py-1 rounded transition ${view === 'admin' ? 'bg-white text-blue-800 font-bold' : 'text-blue-100 hover:text-white'}`}
            >
              Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {view === 'admin' ? (
          <AdminDashboard />
        ) : (
          <div className="max-w-2xl mx-auto">

            {/* Session Selector */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
              <label className="text-gray-700 font-medium">Current Session:</label>
              <select
                value={currentSession}
                onChange={(e) => { setCurrentSession(e.target.value); setParticipant(null); }}
                className="ml-4 p-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sessions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Scanner Area */}
            <Scanner onScan={handleScan} />

            {/* Loading/Error States */}
            {loading && <div className="text-center mt-6 text-gray-500">Loading data...</div>}
            {error && <div className="text-center mt-6 text-red-500 font-bold bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            {/* Participant Details */}
            {participant && !loading && (
              <ParticipantCard
                participant={participant}
                currentSession={currentSession}
                onCheckIn={handleCheckIn}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 p-4 text-center text-sm">
        &copy; 2026 Hackathon Organizer. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
