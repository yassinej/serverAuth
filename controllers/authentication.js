const jwt = require('jwt-simple');
const User = require('../models/user');
const keys = require('../config/keys');

function tokenForUser(user) {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: user._id, iat: timestamp }, keys.jwtSecret);
}
exports.signup = (req, res, next) => {
	const { email, password } = req.body;
	//if form is incomplete send error
	if (!email || !password)
		return res
			.status(422)
			.send({ error: 'You must provide Email and Password' });
	//Check database for email
	User.findOne({ email: email }, (err, existingUser) => {
		if (err) return next(err);
		//if existing user send error
		if (existingUser) return res.status(422).send({ error: 'Email is in use' });

		//if no existing user create and save it
		const user = new User({ email: email, password: password });
		user.save(err => {
			//send error if
			if (err) return next(err);
			//Send success response
			res.json({ token: tokenForUser(user) });
		});
	});
};

exports.signin = (req, res, next) => {
	res.send({ token: tokenForUser(req.user) });
};
