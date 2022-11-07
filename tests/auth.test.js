const request = require('supertest');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');

require('dotenv').config(); // used in routes; configure first

const authRouter = require('../routes/auth');
const usersRouter = require('../routes/users');

const app = express();

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

// In order to have access to sessions. See: https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
const agent = request.agent(app);

let jwt = '';

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

test('Login returns jwt token with valid name and password', (done) => {
  agent
    .post('/auth/login')
    .type('form')
    .send({ username: 'testuserSupertest', password: 'testpasswordSupertest' })
    .expect(200)
    .end((err, res) => {
      // save token for next test
      jwt = res.body.token;
      expect(res.body.message).toEqual('Authentication Successful');
      done();
    });
});

test('Log in route fails informatively for invalid username', (done) => {
  agent
    .post('/auth/login')
    .type('form')
    .send({
      username: 'testuserSupertestDNE',
      password: 'testpasswordSupertest',
    })
    .expect(400)
    .end((err, res) => {
      expect(res.body.message).toEqual('Incorrect username');
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
    .expect(400)
    .end((err, res) => {
      expect(res.body.message).toEqual('Incorrect password');
      done();
    });
});

test('JWT allows access to protected routes', (done) => {
  agent
    .get('/auth/protected')
    .type('form')
    .set('Authorization', `Bearer ${jwt}`)
    .expect(200)
    .end((err, res) => {
      expect(res.body.message).toEqual(
        'You have made it to the protected route'
      );
      done();
    });
});

test('Junk JWT does not allow access to protected routes', (done) => {
  agent
    .get('/auth/protected')
    .type('form')
    .set('Authorization', 'randomStringNotToken')
    .expect(401, done);
});

app.use((err, req, res, next) => {
  res.json(err.message);
});

module.exports = app;
