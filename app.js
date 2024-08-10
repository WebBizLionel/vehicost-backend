require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Middleware
const auth = require('./middlewares/authMiddleware'); 

// Connection to BDD
require('./database/connection');

// Router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var vehiclesRouter = require('./routes/vehicles');

var app = express();
const cors = require('cors'); 
app.use(cors())

const fileUpload = require('express-fileupload'); 
app.use(fileUpload()); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/vehicles',auth, vehiclesRouter); // Use authentification middleware

module.exports = app;
