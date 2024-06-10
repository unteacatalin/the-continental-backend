const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
    getSetting,
    updateSetting
} = require('../services/apiSetting');

exports.getSettings = catchAsync(async (req, res, next) => {
    if (req.error) {
        res.status(401).json({
            status: 'error',
            data: {},
            error: req.error
        });
    }

    // EXECUTE QUERY
    const { data, error } = await getSetting();

    if (error) {
        console.error(error);

        res.status(400).json({
            status: 'error',
            data: { },
            error
        });
    }

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        data: { settings: data?.settings },
        error: ''
    });
})

exports.updateSettings = catchAsync(async (req, res, next) => {
    const newSettings = req.body;

    const { data: settings, error } = await updateSetting(newSettings);

    if (error) {
        console.error(error);
        return res.status(400).json({
          status: 'error',
          data: { },
          error: 'Settings could not be updated'
        }); 
      }
    
      // SEND RESPONSE
      res.status(201).json({
        status: 'success',
        data: settings,
      });    
})