const User = require('../models/userModel');
const { getAll, getOne } = require('../controllers/commonControllerFn');
const tryCatchAsync = require('../utils/tryCatchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = getAll(User, 'users');
exports.getUser = getOne(User, null, 'user');

exports.updateMe = tryCatchAsync(async (request, response, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This router is not intended for password updates. Please use /updateMyPassword route instead.',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = tryCatchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};
