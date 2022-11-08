// App.js configuration to load into tests

const express = require('express');
const session = require('express-session');
const passport = require('passport');

require('dotenv').config();

const authRouter = require('../routes/auth');
const usersRouter = require('../routes/users');

const app = express();

// Required by passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

require('../config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.use((err, req, res, next) => {
  res.json(err.message);
});

module.exports = app;
