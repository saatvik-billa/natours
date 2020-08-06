const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 🤥')
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' }); 
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('DB Connection Successful!'))


const port = process.env.PORT || 3000; 
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
}); 

// allows us to handle all errors with async code that were not previously handled
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 🤥');
    console.log(err.name, err.message);
    // this gives time for the server to finish handling any pending requests before killing it off
    server.close(() => { 
        process.exit(1); // 1 stands for uncaught exception
    });
});


