const tryCatchAsync = require('../utils/tryCatchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.create = (Model) => {
  tryCatchAsync(async (request, response, next) => {
    const data = await Model.create(request.body);
  });
};
