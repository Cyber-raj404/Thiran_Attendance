const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

router.get('/participants', participantController.getAllParticipants);
router.get('/participants/:id', participantController.getParticipant);
router.post('/attendance', participantController.markAttendance);

module.exports = router;
