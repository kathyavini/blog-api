const userRouter = require('../routes/users');
const User = require('../models/user');

const mongoose = require('mongoose');

const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users', userRouter);

require('dotenv').config();

// const { connectDb, closeDb } = require('../config/database');
const { connectDb, closeDb } = require('../config/testingDb');

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDb();
});

describe('Database operations', () => {
  test('Users with all required properties save to database', async () => {
    const testUser = new User({
      displayName: 'A valid user display name',
      username: 'testuser',
      password: 'testpassword',
      editor: false,
      admin: false,
    });

    await testUser.save();
    expect(testUser._id).toBeDefined();
  });

  test('Users without a required property do not save to database', async () => {
    const testUser = new User({
      username: 'invaliduser',
    });

    try {
      await testUser.save();
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });
});

describe('User routes', () => {
  test('Get users path works', (done) => {
    request(app).get('/users').expect('List of users').expect(200, done);
  });

  /* Tests are following the format of this StackOverflow: https://stackoverflow.com/questions/47865190/using-expect-any-with-supertest-to-check-response-body */

  test('Create user route fails with bad input', (done) => {
    request(app)
      .post('/users')
      .type('form')
      .send({
        displayName: 'Supertest Display Name',
        username: 'testuserSupertest',
        password: 'testpasswordSupertest',
        passwordConfirm: 'unmatchingPassword',
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).toEqual({
          errors: ['Password confirmation must match password'],
        });
        done();
      });
  });

  test('Create user route works with valid input', (done) => {
    request(app)
      .post('/users')
      .type('form')
      .send({
        displayName: 'Supertest Display Name',
        username: 'testuserSupertest',
        password: 'testpasswordSupertest',
        passwordConfirm: 'testpasswordSupertest',
      })
      .expect(201)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).toMatchObject({
          displayName: 'Supertest Display Name',
          username: 'testuserSupertest',
        });
        done();
      });
  });

  test('Create user fails with duplicated username', (done) => {
    request(app)
      .post('/users')
      .type('form')
      .send({
        displayName: 'Supertest Display Name',
        username: 'testuserSupertest',
        password: 'testpasswordSupertest',
        passwordConfirm: 'testpasswordSupertest',
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).toEqual({
          errors: 'Username already exists',
        });
        done();
      });
  });
});

app.use((err, req, res, next) => {
  res.json(err.message);
});

module.exports = app;
