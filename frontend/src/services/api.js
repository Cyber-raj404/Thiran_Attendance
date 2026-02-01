import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if backend runs elsewhere
});

export const fetchParticipant = (id) => API.get(`/participants/${id}`);
export const fetchAllParticipants = () => API.get('/participants');
export const markAttendance = (id, sessionId, status) => API.post('/attendance', { id, sessionId, status });

export default API;
