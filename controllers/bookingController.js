const catchAsync = require('../utils/catchAsync');
const {
    getBookings: getBookingsApi,
    getBooking: getBookingApi,
    createEditBooking: createEditBookingApi,
    deleteBooking: deleteBookingApi
} = require('../services/apiBooking');

exports.getBookings = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { bookings, count, pageSize, from, to, error } = await getBookingsApi(req);

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
    });
});

exports.getBooking = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { booking, error } = await getBookingApi(req);

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
      results: booking?.length,
      data: { booking },
      error: '',
    });
});

exports.createEditBooking = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const newBooking = req.body;

    const { data: booking, error } = await createEditBookingApi({newBooking, id});

    if (error) {
        console.error(error);
        return res.status(400).json({
            status: 'error',
            data: {},
            error: 'Booking could not be created or edited'
        });
    }

    // SEND RESPONSE
    return res.status(201).json({
        status: 'success',
        data: booking
    });
});

exports.deleteBooking = catchAsync(async function (req, res, next) {
    const id = req.params.id;

    if (!id) {
        console.error('Missing booking id');

        return res.status(400).json({
            status: 'error',
            data: {  },
            error: 'Missing booking id'
        });
    }

    const { error } = await deleteBookingApi(id);

    if (error) {
        console.error(error);
        return res.status(400).json({
            status: 'error',
            data: { },
            error: 'Booking data could not be deleted'
        });
    }

    // SEND RESPONSE
    return res.status(200).json({
        status: 'success',
        data: { },
        error: ''
    });
})