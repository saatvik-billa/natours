const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); 
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean'); 
const hpp = require('hpp');
const cookieParser = require('cookie-parser'); 

const AppError = require('./utils/appError') 
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// set up the pug engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // where the views folder is located

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); // means that all static files like css will be served from a folder called public

// Sets security HTTP headers
app.use(helmet()); 

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}; 

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!' 
});
// this automatically creates two new headers (X-RateLimit-Limit, X-RateLimit-Remaining, & X-RateLimit-Reset) in the HTTP Request
app.use('/api', limiter); // this will affect all the routes that start with /api

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })) // need this in order to parse data coming from a url encoded form
app.use(cookieParser()); 

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // looks at the req body, query string, and params and then filters out all the dollar signs and dots 

// Data sanitization against XSS
app.use(xss()); // if someone were to insert HTML code as user input, this would convert the HTML symbols to other things to prevent anything bad

// Prevent parameter pollution
app.use(hpp({
    whitelist: [ // these fields won't be affected by this middleware
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
})); 

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next(); 
});


app.use('/', viewRouter); 
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;