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

  const imageName = `${Math.random()}-${newRoom.image?.name}`?.replaceAll(
    '/',
    '',
  );

  const imagePath = hasImage
    ? hasImagePath
      ? newRoom.image
      : `${supabaseUrl}/storage/v1/object/public/room-images/${imageName}`
    : `${supabaseUrl}/storage/v1/object/public/room-images/missing_picture.jpg`;

  return { hasImagePath, imageName, imagePath }
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

exports.createEditRoom = async function ({ newRoom, req, id }) {
  const hasImage = !!newRoom?.image;

  const { hasImagePath, imageName, imagePath } = getImage(hasImage, newRoom);

  console.log({createEditRoomReq: req});

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

  if (req.busboy) {
    req.busboy.on('file', async function (name, file, info) {
      console.log("received file");
      var fstream = fs.createWriteStream('./public/files/temp/' + name);
      file.pipe(fstream);
      fstream.on('close', async function () {
        // 2. Update image
        const { error: storageError } = await supabase.storage
        .from('room-images')
        .upload('./public/files/temp/' + name, newRoom.image);

        // 3. Delete the cabin IF there was an error uploading image
        if (storageError) {
          await supabase.from('rooms').delete().eq('id', data.id);
          console.error(storageError);
        }

        console.log("saved file");

        return {
          data: { room: Array.isArray(room) ? room[0] : room },
          error: storageError,
        };
      });
    });
    req.pipe(req.busboy);
  }

  return { data: {room: {}}, error: 'Could not load image!'};

};
