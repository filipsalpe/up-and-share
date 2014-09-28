'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Upload = mongoose.model('Upload'),
	_ = require('lodash');

/**
 * Create a Upload
 */
exports.create = function(req, res) {
	var upload = new Upload(req.body);
	upload.user = req.user;

	upload.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(upload);
		}
	});
};

/**
 * Show the current Upload
 */
exports.read = function(req, res) {
	res.jsonp(req.upload);
};

/**
 * Update a Upload
 */
exports.update = function(req, res) {
	var upload = req.upload ;

	upload = _.extend(upload , req.body);

	upload.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(upload);
		}
	});
};

/**
 * Delete an Upload
 */
exports.delete = function(req, res) {
	var upload = req.upload ;

	upload.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(upload);
		}
	});
};

/**
 * List of Uploads
 */
exports.list = function(req, res) { Upload.find().sort('-created').populate('user', 'displayName').exec(function(err, uploads) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(uploads);
		}
	});
};

/**
 * Upload middleware
 */
exports.uploadByID = function(req, res, next, id) { Upload.findById(id).populate('user', 'displayName').exec(function(err, upload) {
		if (err) return next(err);
		if (! upload) return next(new Error('Failed to load Upload ' + id));
		req.upload = upload ;
		next();
	});
};

/**
 * Upload authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.upload.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};