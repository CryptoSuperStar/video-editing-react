const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// const passportConfig = require('./passportTwitter.js');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');

//setup configuration for Twitter login
// passportConfig();

const app = express();

//Connect to Database
connectDB();

//Use bodyparser
app.use(function (req, res, next) {
  if (req.header('x-forwarded-proto') === 'http') {
    res.redirect(301, 'https://' + req.hostname + req.url);
    return
  }
  next()
});
app.use(express.urlencoded({extended: true}));
app.use(express.json({limit: "50mb"}));
app.use(express.text());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.static(path.join(__dirname, '../client/public')));

//Load all routes
const userRouter = require('./routes/user.route.js');
const paymentRouter = require('./routes/payment.route');
const projectRouter = require('./routes/projects.route');
const shareRouter = require('./routes/share.route');
//Use routes
app.use('/api/', userRouter);
app.use('/api/', paymentRouter);
app.use('/api/', projectRouter);
app.use('/api/', shareRouter);

// enable cors
let corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
// app.use(cors(corsOption));
if(process.env.NODE_ENV === 'development') {
  app.use(cors({...corsOption, origin: process.env.CLIENT_URL}));
  app.use(morgan('dev'));
  //morgan give information about each request
  //Cors it's allow to deal with react for localhost at port 3000 without any problem
}

const PORT = process.env.PORT || 4000;

// Default route for production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname,'../client','build','index.html'))
  });
}

app.listen(PORT,() => {
  console.log(`Server https running at ${PORT}`);
});