const catchAsync = require('../utils/catchAsync');
const {
    getGuests,
    createEditGuest: createEditGuestApi,
    deleteGuest: deleteGuestApi,
    getGuestsRowCount: getGuestsRowCountApi
} = require('../services/apiGuests');

exports.getAllGuests = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { guests, error } = await getGuests(req);

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
        data: { guests },
        error: '',
    });
});

exports.getGuestsCount = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { count, error } = await getGuestsRowCountApi(req);

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
        data: { count },
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
            data: {  },
            error: 'Guest data could not be deleted'
        });
    }

    // SEND RESPONSE
    return res.status(200).json({
        status: 'success',
        data: {  },
        error: ''
    });
})