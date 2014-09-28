'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var uploads = require('../../app/controllers/uploads');

	// Uploads Routes
	app.route('/uploads')
		.get(uploads.list)
		.post(users.requiresLogin, uploads.create);

	app.route('/uploads/:uploadId')
		.get(uploads.read)
		.put(users.requiresLogin, uploads.hasAuthorization, uploads.update)
		.delete(users.requiresLogin, uploads.hasAuthorization, uploads.delete);

	// Finish by binding the Upload middleware
	app.param('uploadId', uploads.uploadByID);
};