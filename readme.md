<h1 align="center">Blog API</h1>

<p align="center">
RESTful API in Express with jwt authentication
</p>

## Description
This project is the API-only backend for The Odin Project [Blog API](https://www.theodinproject.com/lessons/nodejs-blog-api) assignment. It is a REST API designed to be consumed by two React frontends for blog authoring + viewing.

## Project Objectives
- Routes should use RESTful organization
- Users, posts, and comments should be stored in MongoDB and modelled in Mongoose
- JSON Web Tokens should authenticate users for protected routes

## API Endpoints

### Users
| HTTP Verb | Endpoints | Action |
| --- | --- | --- |
| POST | /users | Sign up a new user account |
| POST | /auth/login | Login an existing user account |
| PUT | /users/permissions | Update user permissions (admin) |
| GET | /users/:user_id | Get user information (self/admin) |
| DELETE |  /users/:user_id | Delete user account (self/admin) |
| GET |  /users | Get all users (admin) |

### Blog Posts
| HTTP Verb | Endpoints | Action |
| --- | --- | --- |
| GET | /posts | Get all published posts |
| GET | /posts/unpublished | Get unpublished posts (admin) |
| POST | /posts | Create new post (author) |
| GET | /:post_slug | Get a single blog post |
| PUT | /:post_slug | Update post content (post author) |
| PUT | /:post_slug/publish | Publish post (post author) |
| PUT | /:post_slug/unpublish | Unpublish post (post author) |
| DELETE | /:post_slug | Delete post (post author) |

### Comments
| HTTP Verb | Endpoints | Action |
| --- | --- | --- |
| GET | /:post_slug/comments | Get all post comments |
| POST | /:post_slug/comments | Create a new comment (users) |
| POST | /:post_slug/comments/:comment_id | Reply to a comment (users) |
| GET | /:post_slug/comments/:comment_id | Get a single comment |
| PUT | /:post_slug/comments/:comment_id | Update comment (comment author) |
| DELETE | /:post_slug/comments/:comment_id | Delete comment (comment author) |


### Authors
| HTTP Verb | Endpoints | Action |
| --- | --- | --- |
| GET | /authors | Get list of all authors |
| GET | /authors/:author_slug | Get all posts by author |



## Installation
To run locally:

```bash
git clone git@github.com:kathyavini/blog-api.git
cd blog-api
npm install

# Will listen on port 3000 if available
npm run start
# OR
npm run serverstart # run in development mode with nodemon
```

You will need to supply the following environmental variables in your `.env` file at the package root:

```bash
# Connect string from MongoDB
MONGO_URI

JWT_SECRET # for jwt.sign(); any string

# For Cloudinary
CLOUD_NAME
API_KEY
API_SECRET
```

## Technologies used
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/) MongoDB ODM for Node.js
- [express-validator](https://express-validator.github.io/docs/) Express middleware for validation and sanitization
- [PassportJS](https://www.passportjs.org/) Simple, unobtrusive authentication for Node.js
- [jsonwebtokens](https://github.com/auth0/node-jsonwebtoken) JSON Web Token implementation for Node.js
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) Optimized bcrypt in JavaScript with zero dependencies
- [Cyclic](https://www.cyclic.sh/) Serverless hosting - simple AWS deployment from GitHub

### For testing
- [Supertest](https://github.com/ladjs/supertest) Super-agent driven library for testing node.js HTTP servers
- [Postman](https://www.postman.com/) API platform for building and using APIs
- [mongodb-memory-server](https://nodkz.github.io/mongodb-memory-server/) Spinning up mongod in memory for fast tests


## Challenges
**Testing with Supertest**

I enjoyed using familiar Jest syntax with Supertest. However, after testing a few controllers, I found that it could take another 30-60 minutes of coding to produce a working, passing test in Supertest *after* the endpoint would already return the correct response in Postman. For instance it took a lot more code (relative to Postman) to store and use jwts, and required awkward nested matchers to test uncomplicated JSON:

```js
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: 'adminuser' }),
      ])
    );
```
Although I appreciated the documentation provided by the Supertest testing files, I ended up using only Postman for the remainder of development.



## Future Directions
**Reduce data returned from endpoints**

The API endpoints currently return more information than is necessary (generally the entire database query result) because I wasn't sure exactly what I would like to use on the frontend. After finishing the two frontends these will be trimmed down.