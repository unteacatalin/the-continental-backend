const supabase = require('../utils/supabase');
const { supabaseUrl } = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const MemoryStream = require('memorystream');
const { Buffer } = require('node:buffer');

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

exports.uploadImage = async function(req) {
  let fileName, error;
  console.log("before busboy!!!");
  if (req.busboy) {
    console.log("I'm busboy!!!");
    req.busboy.on('file', async function (name, file, info) {
      // 1. Stream the file in a temp folder
      console.log({name, file, info});
      console.log("received file");
      var memStream = new MemoryStream(['']);
      // var fstream = fs.createWriteStream('./public/files/temp/' + name);
      // file.pipe(fstream);
      // var dataFileBufs = [];

      let dataFile = '';
      memStream.on('error', function(err) {
        console.error(err);
        return {
          data: {},
          error: err,
        };
      })

      memStream.on('data', function(chunk) {
	      // dataFileBufs.push(chunk);
        dataFile += chunk.toString();
      });

      // memStream.write(Buffer.from(file, 'base64'));
      console.log({file: file?.storage});
      // memStream.write(file.getImage());

      memStream.on('end', async function() {
        // var dataFile = Buffer.concat(dataFileBufs);
        if (!info.filename || !info.mimeType) {
          error = 'Missing file name or file type!';
          console.error(error);
          return {
            data: {},
            error,
          };
        } else {
          // 2. Update image
          const { data, error: storageError } = await supabase.storage
            .from('room-images')
            .upload(info.filename, dataFile, { cacheControl: '3600', upsert: true, contentType: info.mimeType });
  
          // 3. Send an error if the file could not be uploaded into Supabase
          if (storageError) {
            error = 'Could not upload image!';
            console.error(storageError);
            // await supabase.from('rooms').delete().eq('id', data.id);
            // console.error(storageError);
          } else {
            fileName = name;
            console.log("saved file");
          }     
        }
      });
      memStream.end('!');      

      // fstream.on('close', async function () {
      // });      
    });
    req.pipe(req.busboy);
    return {
      data: {imageName: `${supabaseUrl}/storage/v1/object/public/room-images/${fileName}`},
      error,
    };
  }
  
  return { data: {imageName: ''}, error }
};
