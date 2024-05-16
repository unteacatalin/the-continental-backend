import supabase, { supabaseUrl } from './supabase';

export async function getRooms() {
  let { data: rooms, error } = await supabase.from('rooms').select('*');

  return {rooms, error};
}

export async function deleteRoom(id) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);

  // if (error) {
  //   console.error(error);
  //   throw new Error('Room data could not be deleted');
  // }

  return {data: {}, error};
}

export async function createEditRoom(newRoom, id) {
  const hasImagePath = newRoom.image?.startsWith?.(supabaseUrl);

  const imageName = `${Math.random()}-${newRoom.image?.name}`?.replaceAll(
    '/',
    ''
  );

  const imagePath = hasImagePath
    ? newRoom.image
    : `${supabaseUrl}/storage/v1/object/public/room-images/${imageName}`;
  // Ex: https://mbehgukaiafkgmqfeboa.supabase.co/storage/v1/object/public/room-images/room-007.jpg

  // 1. Create/edit room
  let query = supabase.from('rooms');

  if (!id) {
    // A) CREATE
    query = query.insert([{ ...newRoom, image: imagePath }]);
  } else {
    // B) EDIT
    query = query.update({ ...newRoom, image: imagePath }).eq('id', id);
  }

  const { data: room, error } = await query.select();

  if (error) {
    console.error(error);
    throw new Error('Room could not be created');
  }

  if (hasImagePath) return room;

  // 2. Upload image
  const { error: storageError } = await supabase.storage
    .from('room-images')
    .upload(imageName, newRoom.image);

  // 3. Delete the cabin IF there was an error uploading image
  if (storageError) {
    await supabase.from('rooms').delete().eq('id', data.id);
    console.error(storageError);
    throw new Error(
      'Room image could not be uploaded and the room was not created'
    );
  }

  return room;
}
