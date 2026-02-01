const googleSheetsService = require('../services/googleSheetsService');

const getParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const participant = await googleSheetsService.getParticipantById(id);

        if (!participant) {
            return res.status(404).json({ message: 'Participant not found' });
        }

        res.json(participant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllParticipants = async (req, res) => {
    try {
        const participants = await googleSheetsService.getAllParticipants();
        res.json(participants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { id, sessionId, status } = req.body;

        if (!id || !sessionId || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const updatedParticipant = await googleSheetsService.markAttendance(id, sessionId, status);

        if (!updatedParticipant) {
            return res.status(404).json({ message: 'Participant not found or update failed' });
        }

        res.json(updatedParticipant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getParticipant,
    getAllParticipants,
    markAttendance
};
