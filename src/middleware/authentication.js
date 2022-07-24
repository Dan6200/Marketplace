const jwt = require('jsonwebtoken')
const db = require('../db')
const { UnauthenticatedError } = require('../errors') 

module.exports = async (...[request,, next]) => {
	// check header
	const authHeader = request.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer '))
		throw new UnauthenticatedError('Authentication invalid')
	const token = authHeader.split(' ')[1]
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET)
		// attach the user to the Job route
		const { userId, name } = payload
		request.user = { userId, name }
		next()
	} catch (err) {
		throw new UnauthenticatedError('Authentication invalid')
	}
}
