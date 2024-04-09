const supabase = require('../utils/supabase');
const { supabaseUrl } = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');

exports.getRooms = async function (req) {
  const features = new APIFeatures(supabase.from('rooms'), req.query)
    .limitFields()
    .filter()
    .sort()
    .paginate();
  // EXECUTE QUERY
  const { data: rooms, error } = await features.query;

  // if (error) {
  //   console.error(error);
  // }

  return { rooms, error };
};

exports.deleteRoom = async function (id) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);

  // if (error) {
  //   console.error(error);
  // }

  return { error };
};

const getImage = function (hasImage, newRoom) {
  const hasImagePath = hasImage && newRoom.image?.startsWith?.(supabaseUrl);

  // const imageName = `${Math.random()}-${newRoom.image?.name}`?.replaceAll(
  //   '/',
  //   '',
  // );

  const imagePath = hasImage
    ? hasImagePath
      // ? newRoom.image
      ? newRoom.imageName
      // : `${supabaseUrl}/storage/v1/object/public/room-images/${imageName}`
      : newRoom.imageName
    : `${supabaseUrl}/storage/v1/object/public/room-images/missing_picture.jpg`;

  return { hasImagePath, imagePath }
}

const addRoom = async function (newRoom) {

  const { data, error } = await supabase.from('rooms').insert([newRoom]).select();

  if (error) {
    console.error(error);
  }

  return { data, error }
}

const editRoom = async function (newRoom, id) {
  const { data, error } = await supabase.from('rooms').update(newRoom).eq('id', id).select();

  if (error) {
    console.error(error);
  }

  return { data, error }
}

exports.createEditRoom = async function ({ newRoom, id }) {
  const hasImage = !!newRoom?.image;

  const { hasImagePath, imagePath } = getImage(hasImage, newRoom);

  let room, error;

  // 1. Create/Update room

  if (!id) {
    // A) CREATE ROOM
    const { data, error: addRoomError } = await addRoom({...newRoom, image: imagePath});
    room = data;
    error = addRoomError;
  } else {
    // B) UPDATE ROOM
    const { data, error: updateRoomError } = await editRoom({...newRoom, image: imagePath}, id);
    room = data;
    error = updateRoomError;
  }

  if (error) {
    console.error(error);
  }

  if (hasImagePath)
    return { data: { room: Array.isArray(room) ? room[0] : room }, error };

  // const uploadFile = req.files.file;
  // const name = uploadFile.name;
  // const md5 = uploadFile.md5();
  // const saveAs = `${md5}_${name}`;
  // uploadFile.mv(`${__dirname}/public/files/temp/${saveAs}`, function(err) {
  //   if (err) {
  //     return res.status(500).send(err);
  //   }
  // }); 

};

// const parseFile = function(req) {
//   const bb = new Busboy({ headers: req.headers });
//   let error = '';
//   let imageFile = null;
//   let fileName;
//   let mimeType;
//   console.log("before busboy!!!");

//   if (bb) {
//     console.log("I'm busboy!!!");
//     // const workQueue = new PQueue({ concurrency: 1 });

//     // async function handleAsyncError(fn) {
//     //   // workQueue.add(async () => {
//     //     try {
//     //       await fn();
//     //     } catch (e) {
//     //       req.unpipe(bb);
//     //       // workQueue.pause();
//     //       console.error(e);
//     //       return res.status(400).json({
//     //         status: 'error',
//     //         data: { },
//     //         error: 'unknown error',
//     //       });
//     //     }
//     //   // });
//     // }

//     // async function handleError(fn) {
//     //   // workQueue.add(async () => {
//     //     try {
//     //       fn();
//     //     } catch (e) {
//     //       req.unpipe(bb);
//     //       // workQueue.pause();
//     //       console.error(e);
//     //       return res.status(400).json({
//     //         status: 'error',
//     //         data: { },
//     //         error: 'unknown error',
//     //       });
//     //     }
//     //   // });
//     // }

//     bb.on('finish', () => {
//       // console.log('AJUNG AICI???', imageFile);
//       // handleAsyncError(async () => {
//         console.log('Done parsing form!');
//         // var image = await Promise.all(imageFile);
//         if (!imageFile) {
//           error = 'File binary data cannot be null';
//           console.error(error);
//           return {
//             status: 'error',
//             data: {},
//             error,
//           };
//         } else if (!fileName || !mimeType) {
//           error = 'Missing file name or file type!';
//           console.error(error);
//           return {
//             status: 'error',
//             data: {},
//             error,
//           };
//         }
//         return {
//           status: 'success',
//           data: {imageFile, fileName, mimeType},
//           error,
//         };
//       // });
//     });      

//     bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
//       // handleError(() => {
//         fileName = filename;
//         mimeType = mimetype;
//         file.on('data', (data) => {
//           if (imageFile === null) {
//             imageFile = data;
//           } else {
//             imageFile = Buffer.concat([imageFile, data]);
//           }
//           console.log('File [' + filename + '] got ' + data.length + ' bytes');
//         }).on('end', () => {
//           console.log('File [' + filename + '] done!');
//         });
//       });
//     // })
    
//     req.pipe(bb);
//   } else {
//     error = 'Missing file';
//     return {
//       status: 'error',
//       data: {},
//       error,
//     };
//   }
  
//   return {
//     status: 'error',
//     data: {},
//     error: 'no file to upload',
//   };
// };

const parseFile = function(req) {
  console.log(req?.file);
  const buffer = req?.file?.buffer;
  const fileName = req?.file?.originalname;
  const mimeType = req?.file?.mimetype;
  let error = '';

  if (!buffer || !fileName || !mimeType) {
    error = 'missing file'
  }

  return {
    data: {imageFile: buffer, fileName, mimeType},
    error,  
  }
}

exports.uploadImage = async function(req) {
  const {data: imageData, error: parseError} = parseFile(req);
  if (parseError) {
    console.error(parseError);
    return { data: {imageName: ''}, error: parseError }
  }
  const imageFile = imageData?.imageFile;
  const name = imageData?.fileName;
  const mime = imageData?.mimeType;

  console.log({uploadImage: imageData});

  // let error = errorImage;

  // if (errorImage) {
  //   return { data: {imageName: ''}, error: errorImage }
  // }

  // 2. Update image
  const { data, error: storageError } = await supabase.storage
  .from('room-images')
  .upload(name, imageFile, { cacheControl: '3600', upsert: true, contentType: mime });

  let error = '';

  // 3. Send an error if the file could not be uploaded into Supabase
  if (storageError) {
    error = 'Could not upload image!';
    console.error(storageError);
    return { data: {imageName: ''}, error }
    // await supabase.from('rooms').delete().eq('id', data.id);
    // console.error(storageError);
  }

  return { data: {imageName: `${supabaseUrl}/storage/v1/object/public/room-images/${name}`}, error }
}