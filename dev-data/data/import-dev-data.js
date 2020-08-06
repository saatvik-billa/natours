const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' }); 
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const { argv, exit } = require('process');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
.then(() => console.log('DB Connection Successful!'))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

const importData = async () => {
    try {
        await Tour.create(tours)
        // await Review.create(reviews)
        // await User.create(users, { validateBeforeSave: false })
        console.log('Data successfully loaded')
        process.exit(); 
    } catch (err) {
        console.log(err)
    };
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        // await User.deleteMany();
        // await Review.deleteMany();
        console.log('Data successfully deleted')
        process.exit(); 
    } catch (err) {
        console.log(err)
    };
};

// console.log(argv)

if (argv[2] === '--import') {
    importData(); 
} else if (argv[2] === '--delete') {
    deleteData(); 
}