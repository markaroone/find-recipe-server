const tryCatchAsync = require('../utils/tryCatchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createOne = (Model, modelType = 'document') => {
  tryCatchAsync(async (request, response, next) => {
    const newDocument = await Model.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        [`${modelType}`]: newDocument,
      },
    });
  });
};

exports.getOne = (Model, populateOptions, modelType = 'document') =>
  tryCatchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id).select(
      '-createdAt -updatedAt -__v'
    );
    ``;
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) {
      return next(new AppError(`No ${modelType} found with that ID`, 404));
    }

    response.status(200).json({
      status: 'success',
      data: {
        [`${modelType}`]: document,
      },
    });
  });

exports.getAll = (Model, modelType = 'documents') =>
  tryCatchAsync(async (request, response, next) => {
    const features = new APIFeatures(Model.find(), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const documents = await features.query;

    response.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        [`${modelType}`]: documents,
      },
    });
  });

exports.updateOne = (Model, modelType = 'document') =>
  tryCatchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!document) {
      return next(new AppError(`No ${modelType} found with that ID`, 404));
    }

    response.status(200).json({
      status: 'success',
      data: {
        [`${modelType}`]: document,
      },
    });
  });
