const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'You need some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        // required: [true, 'You need to provide a rating']
    },
    createdAt: {
        type: Date, 
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must be associated with a tour breh']
    },
    user:
    {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must have a user']
    }
}, {
    toJSON: { virtual: true},
    toObject: { virtual: true}
});

reviewSchema.pre(/^find/, function(next) {
   this.populate({
       path: 'user',
       select: 'name photo'
   })
   next(); 
});

// user and tour ID combination has to be unique -- ensures that a user can only write one review per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); 

// STATIC METHOD -- available to the model itself
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    // this points to the Model
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

// DOCUMENT MIDDLEWARE
reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);
});

// QUERY MIDDLEWARE
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne(); 
    next(); 
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.tour); 
});

/** RECAP OF BOTH THE QUERY MIDDLEWARES ABOVE
 * Objective is to update the average rating and number of ratings when a review document is either updated or deleted
 * -- 1) We have take the query object and add a property called r, which is the awaited Review, to the query object
 * -- 2) Then in the post middleware we can take the tour id from that query and pass it to the calculate average method
 *      -- this.r.constructor represents the Review model -- need this.r because that represents a review document, not a query object 
 */

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 


