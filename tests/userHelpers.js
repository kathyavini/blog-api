// Functions to seed the database with a user with particular permissions and return the user_id and jwt for that user, and to cleanup

const User = require('../models/user');

const createAdminUser = async (app) => {
  const response = await app //
    .post('/users')
    .type('form')
    .send({
      displayName: 'Supertest Admin User',
      username: 'adminuser',
      password: 'adminuser',
      passwordConfirm: 'adminuser',
    });
  const user_admin = response.body._id;

  await User.findByIdAndUpdate(user_admin, { admin: true });

  const res = await app
    .post('/auth/login')
    .type('form')
    .send({ username: 'adminuser', password: 'adminuser' });
  const jwt_admin = res.body.token;

  return { user_admin, jwt_admin };
};

const createRegularUser = async (app) => {
  const response = await app //
    .post('/users')
    .type('form')
    .send({
      displayName: 'Supertest Regular User',
      username: 'reguser',
      password: 'reguser',
      passwordConfirm: 'reguser',
    });
  const user_reg = response.body._id;

  const res = await app
    .post('/auth/login')
    .type('form')
    .send({ username: 'reguser', password: 'reguser' });
  const jwt_reg = res.body.token;

  return { user_reg, jwt_reg };
};

const createAuthor = async (app) => {
  const response = await app //
    .post('/users')
    .type('form')
    .send({
      displayName: 'Supertest Author',
      username: 'author',
      password: 'author',
      passwordConfirm: 'author',
    });
  const user_author = response.body._id;

  await User.findByIdAndUpdate(user_author, { author: true });

  const res = await app
    .post('/auth/login')
    .type('form')
    .send({ username: 'author', password: 'author' });
  const jwt_author = res.body.token;

  return { user_author, jwt_author };
};

const cleanUpSupertestUsers = async () => {
  try {
    const result = await User.deleteMany({ displayName: /Supertest/ });

    console.log('Records deleted:', result.deletedCount);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createAdminUser,
  createRegularUser,
  createAuthor,
  cleanUpSupertestUsers,
};
