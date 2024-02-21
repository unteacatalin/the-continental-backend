const AppError = require('../utils/appError');
const supabase = require('../utils/supabase');
const { supabaseUrl } = require('../utils/supabase');

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

  return { user, error };
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

  return { user, error };
};

exports.logout = async function () {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Coult not signout');
    // return next(new AppError('Could not signout', 500));
  }

  return { error };
};

exports.getCurrentUser = async function (next) {
  const { data: { session } = {} } = await supabase.auth.getSession();

  if (!session)
    return next(
      new AppError(
        'No active session found! Please log in to get access.',
        401,
      ),
    );

  const { data: { user } = {}, error } = await supabase.auth.getUser();

  if (error)
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );

  return user;
};

exports.updateUser = async function ({ password, fullName, avatar, next }) {
  // 1) Update password OR fullName
  let updateData;
  if (password) updateData = { password };
  if (fullName) updateData = { data: { fullName } };

  const {
    data: { user: userFullNamePassword } = {},
    error: errorFullNamePassword,
  } = await supabase.auth.updateUser(updateData);

  if (errorFullNamePassword)
    return next(
      new AppError('Could not update user. Plase try again later.', 500),
    );

  if (!avatar) return { ...userFullNamePassword };

  // 2) Upload the avatar image
  const fileName = `avatar-${userFullNamePassword.id}-${Math.random()}`;

  const { error: storageError } = await supabase.storage
    .from('avatars')
    .upload(fileName, avatar);

  if (storageError)
    return next(
      new AppError('Could not save image. Please try again later.', 500),
    );

  // 3) Update avatar in the user
  updateData = {
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  };

  // https://mbehgukaiafkgmqfeboa.supabase.co/storage/v1/object/public/avatars/default-user.jpg?t=2023-08-31T18%3A11%3A58.521Z
  const { data: { user: userAvatar } = {}, error: errorAvatar } =
    await supabase.auth.updateUser(updateData);

  if (errorAvatar)
    return next(
      new AppError('Could not update avatar. Please try again later.', 500),
    );

  return { ...userAvatar };
};
