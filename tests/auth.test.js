const request = require('supertest');
const app = require('./testingApp');

// const { connectDb, closeDb } = require('../config/database');
const { connectDb, closeDb } = require('./testingDb');

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDb();
});

const agent = request.agent(app);

let jwt = '';

test('Create user route works with valid input', (done) => {
  agent
    .post('/users')
    .type('form')
    .send({
      displayName: 'Supertest Auth Test',
      username: 'authtest',
      password: 'authtest',
      passwordConfirm: 'authtest',
    })
    .expect(201, done);
});

test('Login returns jwt token with valid name and password', async () => {
  const response = await agent
    .post('/auth/login')
    .type('form')
    .send({ username: 'authtest', password: 'authtest' })
    .expect(200);
  // save token for next test
  jwt = response.body.token;
  expect(response.body.message).toEqual('Authentication Successful');
});

test('Log in route fails informatively for invalid username', async () => {
  const response = await agent
    .post('/auth/login')
    .type('form')
    .send({
      username: 'nonexistentuser',
      password: 'testpasswordSupertest',
    })
    .expect(401);

  expect(response.body.message).toEqual('Incorrect username');
});

test('Log in route fails informatively with invalid password', async () => {
  const response = await agent
    .post('/auth/login')
    .type('form')
    .send({
      username: 'authtest',
      password: 'wrongpassword',
    })
    .expect(401);

  expect(response.body.message).toEqual('Incorrect password');
});

test('JWT allows access to protected routes', async () => {
  const response = await agent
    .get('/auth/protected')
    .type('form')
    .set('Authorization', `Bearer ${jwt}`)
    .expect(200);

  expect(response.body.message).toEqual(
    'You have made it to the protected route'
  );
});

test('Junk JWT does not allow access to protected routes', (done) => {
  agent
    .get('/auth/protected')
    .type('form')
    .set('Authorization', 'randomStringNotToken')
    .expect(401, done);
});
