const jwt = require('jsonwebtoken');

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
