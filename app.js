const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');

require('dotenv').config(); // used in routes; configure first

const authRouter = require('./routes/auth');
const authorsRouter = require('./routes/authors');
const commentsRouter = require('./routes/comments');
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

const { connectDb } = require('./config/database');
connectDb();

const app = express();

app.use(
  cors({ origin: ['http://localhost:8000', 'https://kathyavini.github.io'] })
);

// Set up local authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/authors', authorsRouter);
app.use('/', postsRouter);
app.use('/', commentsRouter);

app.use((err, req, res, next) => {
  res.json(err.message);
});

module.exports = app;
