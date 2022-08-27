const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const tryCatchAsync = require('../utils/tryCatchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, request, response) => {
  const token = signToken(user._id);

  const expirationTime = +process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000;

  response.cookie('jwt', token, {
    expires: new Date(Date.now() + expirationTime),
    httpOnly: true,
    secure: request.secure || request.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
  });

  user.password = undefined;

  response.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = tryCatchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  });

  createSendToken(newUser, 201, request, response);
});

exports.login = tryCatchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Invalid email or password', 401));

  createSendToken(user, 200, request, response);
});

exports.logout = tryCatchAsync(async (request, response, next) => {
  response.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: request.secure || request.headers['x-forwarded-proto'] === 'https',
  });

  response.status(200).json({
    status: 'success',
  });
});

exports.protect = tryCatchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it exists
  const { authorization } = req.headers;
  let token;

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === 'loggedout')
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );

  // 2) Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError('The user with this token no longer exists.', 401)
    );

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  // res.locals.user = currentUser;

  next();
});
