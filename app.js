const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');

const app = express();

const corsConfig = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
};

app.use(cors(corsConfig));

// MIDDLEWARES

process.env.NODE_ENV.trim() === 'development' && app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ROUTES
app.use('/api/v1/users', userRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Cannot find ${request.originalUrl} in this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
