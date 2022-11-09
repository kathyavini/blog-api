const request = require('supertest');
const app = require('./testingApp');

const mongoose = require('mongoose');
const User = require('../models/user');

// const { connectDb, closeDb } = require('../config/database');
const { connectDb, closeDb } = require('../config/testingDb');

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDb();
});

const agent = request.agent(app);

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
    agent
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
    agent
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
    agent
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

describe('Protected user routes', () => {
  let jwt_admin = '';
  let user_admin = '';
  let jwt_reg = '';

  // Test just to seed database
  test('Creating admin and non-admin users works', (done) => {
    // Seed regular user
    agent
      .post('/users')
      .type('form')
      .send({
        displayName: 'Regular User Test',
        username: 'reguser',
        password: 'reguser',
        passwordConfirm: 'reguser',
      })
      .expect(201)
      .then(
        agent
          // Seed admin user
          .post('/users')
          .type('form')
          .send({
            displayName: 'Admin Test',
            username: 'adminuser',
            password: 'adminuser',
            passwordConfirm: 'adminuser',
          })
          .expect(201)
          .end(async (err, res) => {
            user_admin = res.body._id;

            await User.findByIdAndUpdate(user_admin, { admin: true });

            done();
          })
      );
  });

  // Test just to grab jwts from .end()
  test('Admin and regular users can get a jwt', (done) => {
    agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'adminuser', password: 'adminuser' })
      .expect(200)
      .then((res) => {
        // save token for next test
        jwt_admin = res.body.token;
        expect(res.body.message).toEqual('Authentication Successful');

        agent
          .post('/auth/login')
          .type('form')
          .send({ username: 'reguser', password: 'reguser' })
          .expect(200)
          .end((err, res) => {
            // save token for next test
            jwt_reg = res.body.token;
            expect(res.body.message).toEqual('Authentication Successful');
            done();
          });
      });
  });

  test('Admin can GET list of authorized users', (done) => {
    agent
      .get('/users')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ username: 'adminuser' }),
          ])
        );
        done();
      });
  });

  test('Client with no valid token receives 401 Unauthorized when retrieving list of users', (done) => {
    agent
      .get('/users')
      .set('Authorization', `Bearer junk-string`)
      .expect(401, done);
  });

  test('User with valid non-admin token receives 403 forbidden when retrieving list of users', (done) => {
    agent
      .get('/users')
      .set('Authorization', `Bearer ${jwt_reg}`)
      .expect(403, done);
  });

  test('Admin user can update user permissions ', (done) => {
    agent
      .put('/users/permissions')
      .type('form')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .send({
        user_id: user_admin,
        author: true,
      })
      .expect(200)
      .then(async (err, res) => {
        const theuser = await User.findById(user_admin);

        expect(theuser.author).toEqual(true);
        done();
      });
  });

  test('Admin user gets informative error if user_id is missing ', (done) => {
    agent
      .put('/users/permissions')
      .type('form')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .send({
        author: true,
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body.errors).toEqual(
          expect.arrayContaining(['User id required'])
        );
        done();
      });
  });

  test('Admin user gets informative error if permissions object is missing ', (done) => {
    agent
      .put('/users/permissions')
      .type('form')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .send({
        user_id: user_admin,
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body).toMatchObject({
          error: 'No user permissions values provided',
        });
        done();
      });
  });
});
