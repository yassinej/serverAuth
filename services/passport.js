const passport = require('passport');
const User = require('../models/user');
const keys = require('../config/keys');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
//Setup options for Local strategy
const localOptions = { usernameField: 'email' };
//Create local strategy
const localLogin = new LocalStrategy(localOptions, function(
	email,
	password,
	done
) {
	//see if user email exists in dB
	//it not, call 'done' without the object
	//if it does, compare password and if same call 'done' with the user object

	User.findOne({ email: email }, function(err, user) {
		if (err) return done(err);
		if (!user) return done(null, false);

		user.comparePassword(password, function(err, isMatch) {
			if (err) return done(err);
			if (!isMatch) return done(null, false);

			return done(null, user);
		});
	});
});

//Setup options for JWT strategy
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('authorization'),
	secretOrKey: keys.jwtSecret
};

//Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
	//see if user id in payload exists in dB
	//if it does, call 'done' with the user object
	//it not, call 'done' without the object
	User.findById(payload.sub, function(err, user) {
		if (err) return done(err, false);
		if (user) {
			done(null, user);
		} else {
			done(null, false);
		}
	});
});

passport.use(jwtLogin);
passport.use(localLogin);
