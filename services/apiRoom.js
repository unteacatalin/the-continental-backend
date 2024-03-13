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

exports.getImage = function (hasImage, newRoom) {
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

exports.createEditRoom = async function ({ newRoom, id }) {
  const hasImage = !!newRoom?.image;

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

  // 1) Create/edit room
  let query = supabase.from('rooms');

  if (!id) {
    // A) CREATE
    query = query.insert([{ ...newRoom, image: imagePath }]);
  } else {
    // B) Edit
    query = query.update({ ...newRoom, image: imagePath }).eq('id', id);
  }

  const { data: room, error } = await query.select();

  if (error) {
    console.error(error);
  }

  if (hasImagePath)
    return { data: { room: Array.isArray(room) ? room[0] : room }, error };

  // 2. Update image
  const { error: storageError } = await supabase.storage
    .from('room-images')
    .upload(imageName, newRoom.image);

  // 3. Delete the cabin IF there was an image uploading image
  if (storageError) {
    await supabase.from('rooms').delete().eq('id', data.id);
    console.error(storageError);
  }

  return {
    data: { room: Array.isArray(room) ? room[0] : room },
    error: storageError,
  };
};
