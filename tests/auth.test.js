const request = require('supertest');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');

const authRouter = require('../routes/auth');
const usersRouter = require('../routes/users');

const app = express();

require('dotenv').config();

// const { connectDb, closeDb } = require('../config/database');
const { connectDb, closeDb } = require('../config/testingDb');

// Set up local authentication
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/auth', authRouter);

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDb();
});

// In order to have access to sessions
const agent = request.agent(app);

// Just to save a user to this instance of the testing database
test('Create user route works with valid input', (done) => {
  agent
    .post('/users')
    .type('form')
    .send({
      displayName: 'Supertest Display Name',
      username: 'testuserSupertest',
      password: 'testpasswordSupertest',
      passwordConfirm: 'testpasswordSupertest',
    })
    .expect(201, done);
});

test('Log in route redirects with valid name and password', (done) => {
  agent
    .post('/auth/login')
    .type('form')
    .send({ username: 'testuserSupertest', password: 'testpasswordSupertest' })
    .expect(302)
    .end((err, res) => {
      expect(res.header.location).toEqual('/auth/success');
      done();
    });
});

test('Log in route with valid name and password returns user object', (done) => {
  agent
    .post('/auth/login')
    .type('form')
    .send({ username: 'testuserSupertest', password: 'testpasswordSupertest' })
    .redirects(1)
    .expect(200)
    .end((err, res) => {
      expect(res.body).toMatchObject({ username: 'testuserSupertest' });
      done();
    });
});

test('Log in route fails informatively with invalid name', (done) => {
  agent
    .post('/auth/login')
    .type('form')
    .send({
      username: 'testuserSupertestDNE',
      password: 'testpasswordSupertest',
    })
    .redirects(1)
    .expect(400)
    .end((err, res) => {
      expect(res.body).toEqual({ errors: ['Incorrect username'] });
      done();
    });
});

test('Log in route fails informatively with invalid password', (done) => {
  agent
    .post('/auth/login')
    .type('form')
    .send({
      username: 'testuserSupertest',
      password: 'testpasswordSupertestDNE',
    })
    .redirects(1)
    .expect(400)
    .end((err, res) => {
      expect(res.body).toEqual({
        errors: ['Incorrect username', 'Incorrect password'],
      });
      done();
    });
});

app.use((err, req, res, next) => {
  res.json(err.message);
});

module.exports = app;
