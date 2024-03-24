const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
// const fileUpload = require('express-fileupload');
const busboy = require('connect-busboy');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const roomRouter = require('./routes/roomRoutes');
const userRouter = require('./routes/userRoutes');
const settingRouter = require('./routes/settingRoutes');

const app = express();

app.enable('trust proxy');

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(
  cors({
    credentials: true,
    origin: 'https://gregarious-moonbeam-01fd30.netlify.app',
  }),
);

app.options(
  '*',
  cors({
    credentials: true,
    origin: 'https://gregarious-moonbeam-01fd30.netlify.app',
  }),
);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'worker-src': ['blob:'],
        'child-src': ['blob:', 'https://mbehgukaiafkgmqfeboa.supabase.co'],
        'img-src': ["'self'", 'data: image/webp'],
        'script-src': [
          "'self'",
          'https://mbehgukaiafkgmqfeboa.supabase.co',
          'https://untea-the-continental-backend-b7b62ca8f70a.herokuapp.com/',
          'https://gregarious-moonbeam-01fd30.netlify.app/',
          "'unsafe-inline'",
        ],
        'connect-src': [
          "'self'",
          'ws://localhost:*',
          'ws://127.0.0.1:*',
          'http://127.0.0.1:*',
          'http://localhost:*',
          'https://mbehgukaiafkgmqfeboa.supabase.co',
          'https://untea-the-continental-backend-b7b62ca8f70a.herokuapp.com',
          'https://gregarious-moonbeam-01fd30.netlify.app/',
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(busboy({
  highWaterMark: 1 * 1024 * 1024,
  limits: {
    fileSize: 2 * 1024 * 1024,
  }  
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!',
  validate: { trustProxy: false },
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  }),
);
app.use(cookieParser());

// Data sanitization against XSS
app.use(xss());

app.use(compression());

  // fileUpload({
  //   limits: { fileSize: 2 * 1024 * 1024 },
  //   abortOnLimit: true,
  //   // useTempFiles: true,
  //   // safeFileNames: true,
  //   // preserveExtension: true,
  //   // tempFileDir: `${__dirname}/public/files/temp`
  // })
// );

// ROUTES
app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/settings', settingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
