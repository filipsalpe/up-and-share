'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var errorHandler = require('./errors');
var Upload = mongoose.model('Upload');
var _ = require('lodash');
var flow = require('../services/flow.js')();
var path = require('path');
var mime = require('mime');
var fs = require('fs');

/**
 * Create an Upload
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
 * Update an Upload
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
exports.list = function(req, res) { Upload.find().sort('-created')
    .populate('user', 'displayName')
    .exec(function(err, uploads) {
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
exports.uploadByID = function(req, res, next, id) { Upload.findById(id)
    .populate('user', 'displayName')
    .exec(function(err, upload) {
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

exports.postFile = function(req, res) {
    flow.post(req, function(status) {
        res.status(status).send();
    });
};

exports.getFile = function(req, res) {
    flow.has(req, function(result) {
        var status = result ? 200 : 204;
        res.status(status).send();
    });
};

exports.downloadFile = function(req, res) {
    var file = './uploads/' + req.params.identifier;

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
};
