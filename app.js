const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');

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
  cors({
    origin: [
      'http://localhost:8000',
      'http://localhost:4173',
      'http://mac:8000',
      'http://mac:4173',
      'https://kathyavini.github.io',
    ],
  })
);

require('./config/passport');

app.use(passport.initialize());

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
