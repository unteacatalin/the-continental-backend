const catchAsync = require('../utils/catchAsync');
const {
    getGuests,
    createEditGuest: createEditGuestApi
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
    res.status(200).json({
        status: 'success',
        results: guests?.length,
        data: { guests },
        error: '',
    });
});

exports.createEditGuest = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const newGuest = req.body;

    const { data: guest, error } = await createEditGuestApi(id ? {...newGuest, id} : newGuest);

    if (error) {
        console.error(error);
        return res.status(400).json({
            status: 'error',
            data: {},
            error: 'Guest could not be created or edited'
        });
    }

    // SEND RESPONSE
    req.status(201).json({
        status: 'success',
        data: guest
    });
});