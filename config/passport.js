const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require('../models/user');

const options = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: `${process.env.JWT_SECRET}`, // providing in a template literal because I had to do so in jwt.sign() or else jwt would error
};

passport.use(
  new JWTStrategy(options, function (jwt_payload, done) {
    // For debugging
    console.log('jwtpayload is ', jwt_payload);
    // For debugging
    const readableIssued = new Date(
      jwt_payload.iat * 1000
    ).toLocaleTimeString();
    const readableExpiry = new Date(
      jwt_payload.exp * 1000
    ).toLocaleTimeString();
    console.log('issued at time is', readableIssued);
    console.log('expiry time is', readableExpiry);

    User.findOne({ _id: jwt_payload.user._id }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      return done(null, jwt_payload);
    });
  })
);
