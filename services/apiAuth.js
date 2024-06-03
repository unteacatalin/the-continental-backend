const path = require('path');

const AppError = require('../utils/appError');
const supabase = require('../utils/supabase');
const { supabaseUrl } = require('../utils/supabase');
const {getHash} = require('../utils/helpers');

exports.signup = async function ({ fullName, email, password }) {
  const {
    data: { user },
    error: supabaseError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: '',
      },
    },
  });

  let error;

  if (supabaseError) {
    console.error(supabaseError);
    error = 'Could not signup. Please try again later.';
    // return next(new AppError('Could not signup. Please try again later.', 500));
  }

  return { data: {user}, error };
};

exports.login = async function ({ email, password }) {
  const { data, error: supabaseError } = await supabase.auth.signInWithPassword(
    {
      email,
      password,
    },
  );

  let error;

  if (supabaseError) {
    // return next(new AppError('Could not signin', 500));
    console.error(supabaseError);
    error = 'Could not signin';
  }

  const user = data.user;

  return { data: {user}, error };
};

exports.logout = async function () {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Coult not signout');
    // return next(new AppError('Could not signout', 500));
  }

  return { error };
};

exports.getCurrentUser = async function () {
  let err = '';

  const { data: { session } = {} } = await supabase.auth.getSession();

  if (!session) {
    console.error('No active session found! Please log in to get access.');
    err = 'No active session found! Please log in to get access.';
  }
    // return next(
    //   new AppError(
    //     'No active session found! Please log in to get access.',
    //     401,
    //   ),
    // );

  const { data: { user } = {}, error } = await supabase.auth.getUser();

  if (error) {
    console.error('You are not logged in! Please log in to get access.');
    err = 'You are not logged in! Please log in to get access.';
  }
    // return next(
    //   new AppError('You are not logged in! Please log in to get access.', 401),
    // );

  return {user, error: err};
};

exports.updateUser = async function ({ password, fullName, avatar, next }) {
  // 1) Update fullName
  let updateData = {};

  if (fullName && avatar) updateData = { ...updateData, data: { fullName, avatar } };
  else if (fullName) updateData = { ...updateData, data: { fullName } };
  else if (avatar) updateData = { ...updateData, data: { avatar } }

  if (password) updateData = { ...updateData, password };

  let error = '';

  const {
    data: { user: userFullNameAvatar } = {},
    error: errorFullNameAvatar,
  } = await supabase.auth.updateUser(updateData);

  if (errorFullNameAvatar) {
    console.error(errorFullNameAvatar);
    error = 'Could not update user. Plase try again later.';
  }

  console.log({ updatedUser: userFullNameAvatar });

  return { data: {user: userFullNameAvatar}, error };
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

exports.uploadAvatarImage = async function(req) {
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
  .from('avatars')
  .upload(newFileName, imageFile, { cacheControl: '3600', upsert: true, contentType: mime });

  let error = '';

  // 3. Send an error if the file could not be uploaded into Supabase
  if (storageError) {
    error = 'Could not upload avatar image!';
    console.error(storageError);
    return { data: {imageName: ''}, error }
  }

  // 4. Return image url from supabase storage
  return { data: {imageName: `${supabaseUrl}/storage/v1/object/public/avatars/${newFileName}`}, error }
}
