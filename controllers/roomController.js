const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const {
  getRooms,
  deleteRoom: deleteRoomApi,
  createEditRoom: createEditRoomApi,
  uploadImage: uploadImageApi
} = require('../services/apiRoom');

exports.getAllRooms = catchAsync(async (req, res, next) => {
  // To allow for nested GET Reviews on tour (hack)
  let filter = {};
  // if (req.params.tourid) {
  //   filter = { tour: req.params.tourid };
  // }

  // if (req.error) {
  //   console.error(req.error);
  //   // SEND RESPONSE
  //   return res.status(401).json({
  //     status: 'error',
  //     data: { },
  //     error: req.error,
  //   });  
  // }

  // EXECUTE QUERY
  const { rooms, count, pageSize, from, to, error } = await getRooms(req);

  if (error) {
    console.error(error);
    // return next(new AppError('Rooms data could not be loaded', 400));
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
    data: { rooms, count, pageSize, from, to },
    error: '',
  });
});

// exports.getImageInfo = function (req, res, next) {
//     const { hasImage, newRoom } = req.body;

//     let error;

//     if (!hasImage || !newRoom) {
//       error = 'Missing info in request!';
//     }

//     // EXECUTE QUERY
//     const { hasImagePage, imageName, imagePath } = getImage(hasImage, newRoom);
  
//     // SEND RESPONSE
//     res.status(200).json({
//       data: {hasImagePage, imageName, imagePath}, error
//     });
// };

exports.deleteRoom = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    console.error('Missing room id');

    return res.status(400).json({
      status: 'error',
      data: { },
      error: 'Missing room id'
    }); 
    // return next(new AppError('Missing room id', 400));
  }

  const { error } = await deleteRoomApi(id);

  if (error) {
    console.error(error);
    // return next(new AppError('Room data could not be deleted'));
    return res.status(400).json({
      status: 'error',
      data: { },
      error: 'Room data could not be deleted'
    }); 
  }

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: { },
    error: ''
  });
});

exports.createEditRoom = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const newRoom = req.body;

  console.log({ id, newRoom });

  const { data: room, error } = await createEditRoomApi({ newRoom, id });

  if (error) {
    console.error(error);
    // return next(new AppError('Room could not be created or edited'));
    return res.status(400).json({
      status: 'error',
      data: { },
      error: 'Room could not be created or edited'
    }); 
  }

  // SEND RESPONSE
  res.status(201).json({
    status: 'success',
    data: room,
  });
});

exports.uploadRoomImage = catchAsync(async (req, res, next) => {

  const { data, error } = await uploadImageApi(req);

  if (error) {
    console.error(error);
    return res.status(400).json({
      status: 'error',
      data: { },
      error
    });
  }

  if (!data.imageName) {
    return res.status(400).json({
      status: 'error',
      data: { },
      error: 'Missing image related data'
    });
  }

  const imageName = data?.imageName;

  // SEND RESPONSE
  res.status(201).json({
    status: 'success',
    data: { imageName },
    error: ''
  });
});