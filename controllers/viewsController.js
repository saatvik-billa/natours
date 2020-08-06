const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find(); 
    
    // will go into the views folder (specified above) and look for file called overview
    res.status(200).render('overview', { 
        title: 'All Tours',
        tours
    }); 
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name', 404))
    };
    
    res.status(200).render('tour', {
        title: tour.name,
        tour
    }); 
}); 

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log In'
    }); 
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My Account'
    }); 
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs }}) // will select all the tours that have an id in the tourIDs array

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })

}); 

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name, 
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'My Account',
        user: updatedUser
    });  
}); 