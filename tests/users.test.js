const request = require('supertest');
const app = require('./testingApp');

const User = require('../models/user');

const { connectDb, closeDb } = require('../config/database');
// const { connectDb, closeDb } = require('../config/testingDb');

const {
  createAdminUser,
  createRegularUser,
  cleanUpSupertestUsers,
} = require('./userHelpers');

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDb();
});

const agent = request.agent(app);

test.skip('Cleanup users if using live database', async () => {
  // Deletes all records with displayName matching "Supertest". Only necessary when viewing records in MongoDB Atlas (not relevant to mongodb-memory-server)
  await cleanUpSupertestUsers();
});

describe('User creation routes', () => {
  test('Create user route fails with bad input', async () => {
    const response = await agent
      .post('/users')
      .type('form')
      .send({
        displayName: 'Supertest User Route Test',
        username: 'supertestuserroutes',
        password: 'supertestuserroutes',
        passwordConfirm: 'unmatchingPassword',
      })
      .expect(400);

    expect(response.body).toEqual({
      errors: ['Password confirmation must match password'],
    });
  });

  test('Create user route works with valid input', async () => {
    const response = await agent
      .post('/users')
      .type('form')
      .send({
        displayName: 'Supertest User Create Test',
        username: 'supertestuserroutes',
        password: 'supertestuserroutes',
        passwordConfirm: 'supertestuserroutes',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      displayName: 'Supertest User Create Test',
      username: 'supertestuserroutes',
    });
  });

  test('Create user fails with duplicated username', async () => {
    const response = await agent
      .post('/users')
      .type('form')
      .send({
        displayName: 'Supertest Duplicated Name',
        username: 'supertestuserroutes',
        password: 'supertestuserroutes',
        passwordConfirm: 'supertestuserroutes',
      })
      .expect(400);

    expect(response.body).toEqual({
      errors: 'Username already exists',
    });
  });
});

describe('Protected user routes', () => {
  let jwt_admin = '';
  let user_admin = '';
  let jwt_reg = '';

  test('Admin can GET list of authorized users', async () => {
    ({ user_admin, jwt_admin } = await createAdminUser(agent));
    ({ jwt_reg } = await createRegularUser(agent));

    const response = await agent
      .get('/users')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: 'adminuser' }),
      ])
    );
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

  test('Admin user can update user permissions ', async () => {
    await agent
      .put('/users/permissions')
      .type('form')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .send({
        user_id: user_admin,
        author: true,
      })
      .expect(200);

    const theUser = await User.findById(user_admin);
    expect(theUser.author).toEqual(true);
  });

  test('Admin user gets informative error if user_id is missing ', async () => {
    const response = await agent
      .put('/users/permissions')
      .type('form')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .send({
        author: true,
      })
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining(['User id required'])
    );
  });

  test('Admin user gets informative error if permissions object is missing ', async () => {
    const response = await agent
      .put('/users/permissions')
      .type('form')
      .set('Authorization', `Bearer ${jwt_admin}`)
      .send({
        user_id: user_admin,
      })
      .expect(400);

    expect(response.body).toMatchObject({
      error: 'No user permissions values provided',
    });
  });
});
