const catchAsync = require('../utils/catchAsync');
const {
    getBookings
} = require('../services/apiBooking');

exports.getAllRooms = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { bookings, count, pageSize, from, to, error } = await getBookings(req);

    if (error) {
      console.error(error);
      // SEND RESPONSE
      return res.status(400).json({
        status: 'error',
        data: { },
        error,
      });  
    }
  
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: bookings?.length,
      data: { bookings, count, pageSize, from, to },
      error: '',
    });})