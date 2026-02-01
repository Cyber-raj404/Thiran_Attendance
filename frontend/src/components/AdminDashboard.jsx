import React, { useEffect, useState } from 'react';
import { fetchAllParticipants } from '../services/api';

const AdminDashboard = () => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadParticipants();
    }, []);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            const res = await fetchAllParticipants();
            setParticipants(res.data);
        } catch (err) {
            console.error("Failed to load participants", err);
        } finally {
            setLoading(false);
        }
    };

    const sessions = [
        { key: 'day1_fn', label: 'D1 FN' }, { key: 'day1_an', label: 'D1 AN' },
        { key: 'day2_fn', label: 'D2 FN' }, { key: 'day2_an', label: 'D2 AN' },
        { key: 'day3_fn', label: 'D3 FN' }, { key: 'day3_an', label: 'D3 AN' },
    ];

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.college && p.college.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-lg mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                <button onClick={loadParticipants} className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 text-sm font-medium text-gray-700">Refresh</button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by Name, Booking ID, or College..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Participant</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">College / Event</th>
                            {sessions.map(s => (
                                <th key={s.key} className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{s.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="10" className="text-center py-8 text-gray-500">Loading data...</td></tr>
                        ) : filteredParticipants.length === 0 ? (
                            <tr><td colSpan="10" className="text-center py-8 text-gray-500">No participants found</td></tr>
                        ) : (
                            filteredParticipants.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">{p.id}</td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.department} - {p.rollNo}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-gray-800">{p.college}</p>
                                        <p className="text-xs text-indigo-600 font-medium">Event: {p.events?.day1 || 'N/A'}</p>
                                    </td>
                                    {sessions.map(s => (
                                        <td key={s.key} className="px-2 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-block w-3 h-3 rounded-full ${p.attendance?.[s.key] === 'PRESENT' ? 'bg-green-500 ring-2 ring-green-200' : 'bg-gray-200'
                                                }`} title={p.attendance?.[s.key]}></span>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
