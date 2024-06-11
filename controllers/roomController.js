const catchAsync = require('../utils/catchAsync');
const {
  getRooms,
  deleteRoom: deleteRoomApi,
  createEditRoom: createEditRoomApi,
  uploadImage: uploadImageApi,
  deleteAllRooms: deleteAllRoomsApi
} = require('../services/apiRoom');

const { inRooms } = require('../data/data-rooms');

exports.getAllRooms = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const { rooms, count, pageSize, from, to, error } = await getRooms(req);

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
    data: { rooms, count, pageSize, from, to },
    error: '',
  });
});

exports.deleteRoom = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    console.error('Missing room id');

    return res.status(400).json({
      status: 'error',
      data: { },
      error: 'Missing room id'
    }); 
  }

  const { error } = await deleteRoomApi(id);

  if (error) {
    console.error(error);
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

  const { data: room, error } = await createEditRoomApi({ newRoom, id });

  if (error) {
    console.error(error);
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

exports.deleteAllRooms = catchAsync(async (req, res, next) => {
  let error = '';
  
  const { error: errorDeletingAllRooms } = await deleteAllRoomsApi();

  if (errorDeletingAllRooms) {
    console.error(errorDeletingAllRooms);
    error = 'All rooms data could not be deleted';
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

exports.initRooms = catchAsync(async (req, res, next) => {
  const { data: rooms, error } = await initRoomsApi(inRooms);

  if (error) {
      console.error(error);
      return res.status(400).json({
          status: 'error',
          data: {},
          error: 'Rooms could not be uploaded'
      });
  }

  // SEND RESPONSE
  return res.status(201).json({
      status: 'success',
      data: rooms
  });
});