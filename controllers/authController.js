const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  login: signInApi,
  getCurrentUser,
  logout: signOutApi,
  signup: signUpApi,
  updateUser,
  uploadAvatarImage: uploadAvatarImageApi
} = require('../services/apiAuth');

const signToken = (email) =>
  jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRES_IN}h`,
  });

const setCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000,
    ),
    httpOnly: true,
    /*** ACTIVATE LATER ***/
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    secure: true,
    sameSite: 'none',
    partitioned: true,
  };

  res.cookie('jwt', token, cookieOptions);
}

const createSendToken = (results, statusCode, req, res) => {
  const user = results?.data?.user;
  const error = results?.error;

  if (statusCode.toString().startsWith('2')) {
    if(user && user.email) {
      const token = signToken(user.email);

      setCookie(res, token);

      return res.status(statusCode).json({
        // status: error ? 'error' : 'success',
        // token,
        data: { user },
        error: '',
      });    
    }
  }

  return res.status(statusCode).json({
    // status: error ? 'error' : 'success',
    // token,
    data: { user: {} },
    error,
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const { email, password, fullName } = req.body;

  const newUser = await signUpApi({ fullName, email, password });

  createSendToken(newUser, 201, req, res);
});

exports.signIn = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let userData = { data: { user: {} }, error: '' };

  // 1) Check if email and password exist
  if (!email || !password) {
    console.error('Please provide email and password!');
    userData.error = 'Please provide email and password!';
    return createSendToken(userData, 400, req, res);
    // return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user && password is correct
  userData = await signInApi({ email, password });

  if (!userData || !userData.data || !userData.data.user) {
    console.error('Incorrect email or password');
    userData.error = 'Incorrect email or password';
    return createSendToken(userData, 401, req, res);
    // return next(new AppError('Incorrect email or password', 401));
  } else if (userData.error) {
    console.error(userData.error);
    return createSendToken(userData, 500, req, res);
  }

  // 3) If everything is ok, send token to client
  createSendToken(userData, 200, req, res);
});

exports.signOut = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  const { error } = signOutApi();

  if (error) {
    return res.status(500).json({
      status: 'fail',
      error,
    });
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === 'null') {
    console.error('You are not logged in! Please log in to get access.');
    req.error = 'You are not logged in! Please log in to get access.';
    // return next(
    //   new AppError('You are not logged in! Please log in to get access.', 401),
    // );
  }

  // 2) Verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if token email is the same for the logedin user
  const {user: currentUser, error: currentUserError} = await getCurrentUser();

  if (currentUserError) req.error = currentUserError;

  if (decode?.email !== currentUser?.email) {
    console.error('Token belongs to different user');
    req.error = 'Token belongs to different user';
    // return next(new AppError('Token belongs to different user'));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get current password and new password
  const { currentPassword, newPassword } = req.body;
  const { email } = req.user;

  let userData = { data: { user: {} }, error: '' };

  if (!currentPassword || !newPassword) {
    console.error('Please provide valid current and new password!');
    userData.error = 'Please provide valid current and new password!';
    return createSendToken(userData, 400, req, res);
  }

  // 2) Check if user && current password are correct
  userData = await signInApi({ email, password: currentPassword, next });

  if (!userData || !userData.data || !userData.data.user) {
    console.error('Incorrect email or password');
    userData.error = 'Incorrect email or password';
    return createSendToken(userData, 401, req, res);
  }

  // 3) Change the password
  userData = await updateUser({ password: newPassword, next });

  createSendToken(userData, 201, req, res);
});

exports.getMe = (req, res, next) => {
  let userData = { data: { user: {} }, error: '' };

  if (req.error) {
    console.error(req.error);
    userData.error = req.error;
    return createSendToken(userData, 401, req, res);
  }

  userData.data.user = req.user;

  createSendToken(userData, 200, req, res);
}

exports.updateMyUserData = catchAsync(async (req, res, next) => {
  // 1) Get full name and avatar
  const { fullName, avatar } = req.body;
  let userData = { data: { user: {} }, error: '' };

  // let newUser;
  // let error;

  if (!fullName && !avatar) {
    // 2) Check if there is new data
    userData.data.user = req.user;
  } else if (
    req.user &&
    req.user.user_metadata &&
    req.user.user_metadata.fullName === fullName &&
    req.user.user_metadata.avatar === avatar
  ) {
    // 3) Check if data is changed
    userData.data.user = req.user;
  } else {
    // 4) Update full name and avatar
    userData = await updateUser({ fullName, avatar, next });
  }

  console.log({userData: userData?.user?.user_metadata});

  createSendToken(userData, 200, req, res);
});

exports.uploadAvatarImage = catchAsync(async (req, res, next) => {
  const { data, error } = await uploadAvatarImageApi(req);

  if (error) {
    console.error(error);
    return res.status(400).json({
      status: 'error',
      data: { },
      error
    });
  }

  if (!data.imageName) {
    return res.status(400).json({
      status: 'error',
      data: { },
      error: 'Missing image related data'
    });
  }

  const imageName = data?.imageName;

  // SEND RESPONSE
  res.status(201).json({
    status: 'success',
    data: { imageName },
    error: ''
  });
});
