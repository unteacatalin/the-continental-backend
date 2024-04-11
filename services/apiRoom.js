const supabase = require('../utils/supabase');
const { supabaseUrl } = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');
const crypto = require('crypto');
const path = require('path');

const getHash = ( content ) => {				
  var hash = crypto.createHash('md5');
  //passing the data to be hashed
  data = hash.update(content, 'utf-8');
  //Creating the hash in the required format
  gen_hash= data.digest('hex');
  return gen_hash;
}

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
  // const hasImagePath = hasImage && newRoom.image?.startsWith?.(supabaseUrl);

  // const imageName = `${Math.random()}-${newRoom.image?.name}`?.replaceAll(
  //   '/',
  //   '',
  // );

  const imagePath = hasImage
    ? newRoom.image
    // ? hasImagePath
    //   // ? newRoom.image
    //   ? newRoom.imageName
    //   // : `${supabaseUrl}/storage/v1/object/public/room-images/${imageName}`
    //   : newRoom.imageName
    : `${supabaseUrl}/storage/v1/object/public/room-images/missing_picture.jpg`;

  // return { hasImagePath, imagePath }
  return imagePath
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

  // const { hasImagePath, imagePath } = getImage(hasImage, newRoom);
  const imagePath = getImage(hasImage, newRoom);

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

  // if (hasImagePath)
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

const parseFile = function(req) {
  const buffer = req?.file?.buffer;
  const fileName = req?.file?.originalname;
  const mimeType = req?.file?.mimetype;
  console.log({req});
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
  // Parse form data
  const {data: imageData, error: parseError} = parseFile(req);
  if (parseError) {
    console.error(parseError);
    return { data: {imageName: ''}, error: parseError }
  }
  const imageFile = imageData?.imageFile;
  const name = imageData?.fileName;
  const mime = imageData?.mimeType;
  const fileHash = getHash(imageFile) ;
  const fileExt = path.extname(name);
  const newFileName = fileHash + fileExt;

  // 2. Update image
  const { data, error: storageError } = await supabase.storage
  .from('room-images')
  .upload(newFileName, imageFile, { cacheControl: '3600', upsert: true, contentType: mime });

  let error = '';

  // 3. Send an error if the file could not be uploaded into Supabase
  if (storageError) {
    error = 'Could not upload image!';
    console.error(storageError);
    return { data: {imageName: ''}, error }
  }

  // 4. Return image url from supabase storage
  return { data: {imageName: `${supabaseUrl}/storage/v1/object/public/room-images/${newFileName}`}, error }
}