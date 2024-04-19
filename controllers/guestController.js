const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
    getGuestsRowCount,
    getGuests
} = require('../services/apiGuests');

exports.getGuestsCount = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const { countRows, error } = await getGuestsRowCount(req);
})

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