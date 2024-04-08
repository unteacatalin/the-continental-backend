const supabase = require('../utils/supabase');
const { supabaseUrl } = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');
// const fs = require('fs');
// const MemoryStream = require('memorystream');
const { Buffer } = require('node:buffer');
const busboy = require('busboy');
// const PQueue = require('p-queue');

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

const parseFile = async function(req) {
  const bb = busboy({ headers: req.headers });
  let error = '';
  let imageFile = null;
  let info = {};
  console.log("before busboy!!!");

  if (bb) {
    console.log("I'm busboy!!!");
    // const workQueue = new PQueue({ concurrency: 1 });

    async function handleAsyncError(fn) {
      // workQueue.add(async () => {
        try {
          await fn();
        } catch (e) {
          req.unpipe(bb);
          // workQueue.pause();
          console.error(e);
          return res.status(400).json({
            status: 'error',
            data: { },
            error: 'unknown error',
          });
        }
      // });
    }

    async function handleError(fn) {
      // workQueue.add(async () => {
        try {
          fn();
        } catch (e) {
          req.unpipe(bb);
          // workQueue.pause();
          console.error(e);
          return res.status(400).json({
            status: 'error',
            data: { },
            error: 'unknown error',
          });
        }
      // });
    }

    bb.on('close', () => {
      console.log('AJUNG AICI???', imageFile);
      // handleAsyncError(async () => {
      //   console.log('Done parsing form!');
      //   var image = await Promise.all(imageFile);
      //   if (!image) {
      //     error = 'File binary data cannot be null';
      //     console.error(error);
      //     return {
      //       data: {},
      //       error,
      //     };
      //   } else if (!info.filename || !info.mimeType) {
      //     error = 'Missing file name or file type!';
      //     console.error(error);
      //     return {
      //       data: {},
      //       error,
      //     };
      //   }
      //   return {
      //     data: {imageFile: image, info},
      //     error,
      //   };
      // });
    });      

    bb.on('file', function (name, file, info) {
      handleError(() => {
        info = info;
        file.on('data', (data) => {
          if (imageFile === null) {
            imageFile = data;
          } else {
            imageFile = Buffer.concat([imageFile, data]);
          }
          console.log('File [' + info?.filename + '] got ' + data.length + ' bytes');
        }).on('finish', () => {
          console.log('File [' + info?.filename + '] done!');
        });
      });
    })
    
    req.pipe(bb);
  } else {
    error = 'Missing file';
    return {
      status: 'error',
      data: {},
      error,
    };
  }
  
  return {
    status: 'error',
    data: {},
    error: 'no file to upload',
  };
};

exports.uploadImage = async function(req) {
  const {data: imageData, error: errorImage} = parseFile(req);
  const imageFile = imageData?.imageFile;
  const name = imageData?.info?.filename;
  const mime = imageData?.info?.mimeType;

  console.log({uploadImage: imageData});

  let error = errorImage;

  if (errorImage) {
    return { data: {imageName: ''}, error: errorImage }
  }

  // 2. Update image
  const { data, error: storageError } = await supabase.storage
  .from('room-images')
  .upload(name, imageFile, { cacheControl: '3600', upsert: true, contentType: mime });

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