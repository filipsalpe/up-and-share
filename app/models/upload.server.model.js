'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Upload Schema
 */
var UploadSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Upload name',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    files: {
        type: Array,
        default: []
    }
});

mongoose.model('Upload', UploadSchema);
