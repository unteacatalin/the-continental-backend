const catchAsync = require('../utils/catchAsync');
const {
    getGuests,
    createEditGuest: createEditGuestApi,
    deleteGuest: deleteGuestApi,
    getGuestsRowCount: getGuestsRowCountApi,
    deleteAllGuests: deleteAllGuestsApi,
    initGuests: initGuestsApi
} = require('../services/apiGuests');

const { inGuests } = require('../data/data-guests');

exports.getAllGuests = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { guests, count, pageSize, from, to, error } = await getGuests(req);

    if(error) {
        console.error(error);
        // SEND RESPONSE
        return res.status(400).json({
            status: 'error',
            data: {  },
            error,
        });
    }

    // SEND RESPONSE
    return res.status(200).json({
        status: 'success',
        results: guests?.length,
        data: { guests, count, pageSize, from, to },
        error: '',
    });
});

exports.getGuestsCount = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { count, pageSize, error } = await getGuestsRowCountApi(req);

    if (error) {
        console.error(error);
        // SEND RESPONSE
        return res.status(400).json({
            status: 'error',
            data: {  },
            error
        });
    }

    console.log({count});
    // SEND RESPONSE
    return res.status(200).json({
        status: 'success',
        data: { count, pageSize },
        error: ''
    });
});

exports.createEditGuest = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const newGuest = req.body;

    const { data: guest, error } = await createEditGuestApi({newGuest, id});

    if (error) {
        console.error(error);
        return res.status(400).json({
            status: 'error',
            data: {},
            error: 'Guest could not be created or edited'
        });
    }

    // SEND RESPONSE
    return res.status(201).json({
        status: 'success',
        data: guest
    });
});

exports.deleteGuest = catchAsync(async function (req, res, next) {
    const id = req.params.id;

    if (!id) {
        console.error('Missing guest id');

        return res.status(400).json({
            status: 'error',
            data: {  },
            error: 'Missing guest id'
        });
    }

    const { error } = await deleteGuestApi(id);

    if (error) {
        console.error(error);
        return res.status(400).json({
            status: 'error',
            data: { },
            error: 'Guest data could not be deleted'
        });
    }

    // SEND RESPONSE
    return res.status(200).json({
        status: 'success',
        data: { },
        error: ''
    });
})

exports.deleteAllGuests = catchAsync(async (req, res, next) => {
    let error = '';
    
    const { error: errorDeletingAllGuests } = await deleteAllGuestsApi();
  
    if (errorDeletingAllGuests) {
      console.error(errorDeletingAllGuests);
      error = 'All guests data could not be deleted';
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

exports.initGuests = catchAsync(async (req, res, next) => {
    const { data: guests, error } = await initGuestsApi(inGuests);

    if (error) {
        console.error(error);
        return res.status(400).json({
            status: 'error',
            data: {},
            error: 'Guests could not be uploaded'
        });
    }

    // SEND RESPONSE
    return res.status(201).json({
        status: 'success',
        data: guests
    });
});