import React from 'react';

const ParticipantCard = ({ participant, currentSession, onCheckIn }) => {
    if (!participant) return null;

    const sessions = [
        { key: 'day1_fn', label: 'D1 FN' }, { key: 'day1_an', label: 'D1 AN' },
        { key: 'day2_fn', label: 'D2 FN' }, { key: 'day2_an', label: 'D2 AN' },
        { key: 'day3_fn', label: 'D3 FN' }, { key: 'day3_an', label: 'D3 AN' },
    ];

    const currentStatus = participant.attendance?.[currentSession] || 'ABSENT';
    const isPresent = currentStatus === 'PRESENT';

    // Helper to extract session Day number (e.g., 'day1_fn' -> 'day1') to show relevant Event
    const currentDayKey = currentSession.split('_')[0];
    const currentEvent = participant.events?.[currentDayKey] || 'N/A';

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-6">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">{participant.name}</h2>
                    <p className="text-lg text-indigo-600 font-semibold mt-1">{participant.college}</p>
                    <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <span>{participant.department}</span>
                        <span>•</span>
                        <span>{participant.rollNo}</span>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <span className="block text-xs uppercase text-gray-400 font-bold tracking-wider">Booking ID</span>
                    <span className="text-xl font-mono font-bold text-gray-700">{participant.id}</span>
                </div>
            </div>

            {/* Current Check-in Action */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3">
                    Check-in: {currentSession.replace('_', ' ').toUpperCase()}
                </h3>

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Registered Event</p>
                        <p className="text-lg font-bold text-gray-900">{currentEvent}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <p className={`text-lg font-bold ${isPresent ? 'text-green-600' : 'text-orange-500'}`}>
                            Status: {currentStatus}
                        </p>
                    </div>
                    <button
                        onClick={onCheckIn}
                        disabled={isPresent}
                        className={`px-6 py-3 rounded-lg font-bold shadow-sm transition ${isPresent
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                            }`}
                    >
                        {isPresent ? 'Checked In' : 'Mark Present'}
                    </button>
                </div>
            </div>

            {/* Attendance History */}
            <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Attendance History</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {sessions.map((session) => (
                        <div key={session.key} className={`p-2 rounded border flex flex-col items-center justify-center text-center ${participant.attendance?.[session.key] === 'PRESENT'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-100'
                            }`}>
                            <span className="text-[10px] font-bold text-gray-400 mb-1">{session.label}</span>
                            <div className={`w-3 h-3 rounded-full ${participant.attendance?.[session.key] === 'PRESENT' ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParticipantCard;
