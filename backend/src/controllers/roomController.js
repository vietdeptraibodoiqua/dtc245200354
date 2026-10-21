const roomService = require('../services/roomService');

const getRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await roomService.getRoomTypes();
    res.json({
      success: true,
      data: roomTypes
    });
  } catch (err) {
    next(err);
  }
};

const getAllRooms = async (req, res, next) => {
  try {
    const { floor, status, roomTypeId } = req.query;
    const rooms = await roomService.getAllRooms({ floor, status, roomTypeId });
    res.json({
      success: true,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

const searchAvailableRooms = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate, capacityAdults, roomTypeId, maxPrice } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ checkInDate và checkOutDate'
      });
    }

    const rooms = await roomService.getAvailableRoomsByDate(checkInDate, checkOutDate, {
      capacityAdults: capacityAdults ? parseInt(capacityAdults, 10) : undefined,
      roomTypeId: roomTypeId ? parseInt(roomTypeId, 10) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    });

    res.json({
      success: true,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

const updateRoomStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu trường status cần cập nhật'
      });
    }

    const updatedRoom = await roomService.updateRoomStatus(id, status, notes);
    res.json({
      success: true,
      data: updatedRoom,
      message: 'Cập nhật trạng thái phòng thành công'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoomTypes,
  getAllRooms,
  searchAvailableRooms,
  updateRoomStatus
};
