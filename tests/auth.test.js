const request = require('supertest');
const app = require('./testingApp');

// const { connectDb, closeDb } = require('../config/database');
const { connectDb, closeDb } = require('../config/testingDb');

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDb();
});

// In order to have access to sessions. See: https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport

// This is only necessary for testing session-based authentication, but doesn't interfere with jwt auth testing
const agent = request.agent(app);

let jwt = '';

// Just to save a user to this instance of the testing database
test('Create user route works with valid input', (done) => {
  agent
    .post('/users')
    .type('form')
    .send({
      displayName: 'Auth Route Test',
      username: 'authtest',
      password: 'authtest',
      passwordConfirm: 'authtest',
    })
    .expect(201, done);
});

test('Login returns jwt token with valid name and password', (done) => {
  agent
    .post('/auth/login')
    .type('form')
    .send({ username: 'authtest', password: 'authtest' })
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
      username: 'nonexistentuser',
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
      username: 'authtest',
      password: 'wrongpassword',
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
