const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/types', roomController.getRoomTypes);
router.get('/', roomController.getAllRooms);
router.get('/search', roomController.searchAvailableRooms);
router.patch('/:id/status', roomController.updateRoomStatus);

module.exports = router;
