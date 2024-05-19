const catchAsync = require('../utils/catchAsync');
const {
    getBookings: getBookingsApi,
    getBooking: getBookingApi,
    createEditBooking: createEditBookingApi,
    deleteBooking: deleteBookingApi,
    getBookingsAfterDate: getBookingsAfterDateApi,
    getStaysAfterDate: getStaysAfterDateApi,
    getBookedRoomsInInterval: getBookedRoomsInIntervalApi,
    getStaysTodayActivity: getStaysTodayActivityApi,
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
    console.log({ createEditBooking: newBooking, id });

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
});

exports.getBookingsAfterDate = catchAsync(async (req, res, next) => {
    const date = req.params.date;
    // EXECUTE QUERY
    const { bookings, error } = await getBookingsAfterDateApi(date);

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
      data: { bookings },
      error: '',
    });
});

exports.getStaysAfterDate = catchAsync(async (req, res, next) => {
    const date = req.params.date;
    // EXECUTE QUERY
    const { bookings, error } = await getStaysAfterDateApi(date);

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
      data: { bookings },
      error: '',
    });
});

exports.getBookedRoomsInInterval = catchAsync(async (req, res, next) => {
    const query = req.query;
    const startDate = query?.startDate;
    const endDate = query?.endDate;
    const bookingId = query?.bookingId;

    // EXECUTE QUERY
    const { rooms, error } = await getBookedRoomsInIntervalApi(startDate, endDate, bookingId);

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
      results: rooms?.length,
      data: { rooms },
      error: '',
    });
});

exports.getStaysTodayActivity = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { stays, error } = await getStaysTodayActivityApi();

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
      results: stays?.length,
      data: { stays },
      error: '',
    });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let error = '';
  
    if (!id) {
      error = 'Missing booking id'
      console.error(error);
  
      return res.status(400).json({
        status: 'error',
        data: { },
        error
      }); 
    }
  
    const { error: errorDeletingBooking } = await deleteBookingApi(id);
  
    if (errorDeletingBooking) {
      console.error(errorDeletingBooking);
      error = 'Booking data could not be deleted';
      return res.status(400).json({
        status: 'error',
        data: { },
        error
      }); 
    }
  
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      data: { },
      error
    });
  });
  