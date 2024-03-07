import supabase, { supabaseUrl } from './supabase';
import axios from 'axios';

export async function signup({ fullName, email, password }) {
  // const {
  //   data: { user },
  //   error,
  // } = await axios({
  //   method: 'POST',
  //   headers: {
  //     'Access-Control-Allow-Origin': '*',
  //     'Content-Type': 'application/json',
  //   },
  //   url: 'https://untea-the-continental-backend-b7b62ca8f70a.herokuapp.com/api/v1/users/signup',
  //   data: JSON.stringify({
  //     email,
  //     password,
  //     fullName,
  //   }),
  //   withCredentials: true,
  // });
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: '',
      },
    },
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function login({ email, password }) {
  const {
    data: { user },
    error,
  } = await axios({
    method: 'POST',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    url: 'https://untea-the-continental-backend-b7b62ca8f70a.herokuapp.com/api/v1/users/signin',
    data: JSON.stringify({
      email,
      password,
    }),
    withCredentials: true,
  });
  // {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     email,
  //     password,
  //   }),
  // }
  // const { data, error } = await result.json();

  // supabase.auth.signInWithPassword({
  //   email,
  //   password,
  // });

  if (error) throw new Error(error);

  return user;
}

export async function getCurrentUser(existingUserData, logout) {
  // const { data: { session } = {} } = await supabase.auth.getSession();
  // if (!session) return null;

  // const { data: { user } = {}, error } = await supabase.auth.getUser();

  const { data: { user } = {}, error } = await axios.get(
    'https://untea-the-continental-backend-b7b62ca8f70a.herokuapp.com/api/v1/users/me',
    {
      withCredentials: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  // const { data: { user } = {}, error } = await result.json();

  if (error) throw new Error(error);

  if (existingUserData.jwt_expiry < Date.now()) {
    logout();
    return null;
  } else {
    const newUserData = { ...user, jwt_expiry: existingUserData.jwt_expiry };

    return newUserData;
  }
}

export async function logout() {
  const { error } = await axios.get(
    'https://untea-the-continental-backend-b7b62ca8f70a.herokuapp.com/api/v1/users/me',
    {
      withCredentials: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

  if (error) throw new Error(error.message);
}

export async function updateUser({ password, fullName, avatar }) {
  // 1. Update password OR fullName
  let updateData;
  if (password) updateData = { password };
  if (fullName) updateData = { data: { fullName } };
  const {
    data: { user: userFullNamePassword } = {},
    error: errorFullNamePassword,
  } = await supabase.auth.updateUser(updateData);

  if (errorFullNamePassword) throw new Error(error.message);

  if (!avatar) return { userFullNamePassword };

  // 2. Upload the avatar image
  const fileName = `avatar-${userFullNamePassword.id}-${Math.random()}`;

  const { error: storageError } = await supabase.storage
    .from('avatars')
    .upload(fileName, avatar);

  if (storageError) throw new Error(storageError.message);

  // 3. Update avatar in the user
  updateData = {
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  };

  // https://mbehgukaiafkgmqfeboa.supabase.co/storage/v1/object/public/avatars/default-user.jpg?t=2023-08-31T18%3A11%3A58.521Z
  const { data: { user: userAvatar } = {}, error: errorAvatar } =
    await supabase.auth.updateUser(updateData);

  if (errorAvatar) throw new Error(errorAvatar.message);

  return { userAvatar };
}
