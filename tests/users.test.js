const request = require('supertest');
const app = require('./testingApp');

const mongoose = require('mongoose');
const User = require('../models/user');

const { connectDb, closeDb } = require('../config/database');
// const { connectDb, closeDb } = require('../config/testingDb');

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDb();
});

describe('Database operations', () => {
  test('Users with all required properties save to database', async () => {
    const testUser = new User({
      displayName: 'Supertest Database Test',
      username: 'databasetest',
      password: 'databasetest',
      author: false,
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

describe('User creation routes', () => {
  /* Tests are following the format of this StackOverflow: https://stackoverflow.com/questions/47865190/using-expect-any-with-supertest-to-check-response-body */

  test('Create user route fails with bad input', (done) => {
    request(app)
      .post('/users')
      .type('form')
      .send({
        displayName: 'Supertest User Route Test',
        username: 'supertestuserroutes',
        password: 'supertestuserroutes',
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
        displayName: 'Supertest User Route Test',
        username: 'supertestuserroutes',
        password: 'supertestuserroutes',
        passwordConfirm: 'supertestuserroutes',
      })
      .expect(201)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).toMatchObject({
          displayName: 'Supertest User Route Test',
          username: 'supertestuserroutes',
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
        username: 'supertestuserroutes',
        password: 'supertestuserroutes',
        passwordConfirm: 'supertestuserroutes',
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

describe.only('Protected user routes', () => {
  let jwt = '';
  let user_admin = '';

  // This test is redundant with how it is tested in auth.test.js but I wasn't sure how else to set and save the jwt
  test('Admin user can receive jwt', async () => {
    // Requires an admin user in the database
    const adminUser = new User({
      displayName: 'Test Admin User',
      username: 'adminuser',
      password: 'adminuser',
      passwordConfirm: 'adminuser',
      author: false,
      admin: true,
    });

    await adminUser.save();
    user_admin = adminUser._id;

    request(app)
      .post('/auth/login')
      .type('form')
      .send({ username: 'admin', password: 'admin' })
      .expect(200)
      .end((err, res) => {
        jwt = res.body.token;
        expect(res.body.message).toEqual('Authentication Successful');
        done();
      });
  });

  test.skip('Admin can GET list of authorized users', () => {});

  test('Admin user can update user permissions ', () => {
    request(app)
      .post('/users/permissions')
      .type('form')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        user_id: user_admin,
        author: true,
      })
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        expect(res.body).toBeDefined();
        done();
      });
  });
});
