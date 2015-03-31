'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var Stream = require('stream').Stream;

module.exports = function() {
    var $ = {};
    $.temporaryFolder = './tmp';
    $.uploadFolder = './uploads';
    $.fileParameterName = 'file';

    try {
        fs.mkdirSync(path.resolve($.temporaryFolder));
        fs.mkdirSync(path.resolve($.uploadFolder));
    } catch (e) {}

    function cleanIdentifier(identifier) {
        return identifier.replace(/[^0-9A-Za-z_-]/g, '');
    }

    function getChunkFilename(chunkNumber, identifier) {
        // Clean up the identifier
        identifier = cleanIdentifier(identifier);
        // What would the file name be?
        return path.resolve($.temporaryFolder, './flow-' + identifier + '.' + chunkNumber);
    }

    function validateChunk(chunkNumber, numberOfChunks, fileSize, chunkSize, totalSize) {
        if (chunkNumber < numberOfChunks && fileSize !== chunkSize) {
            return false;
        }
        if (
            numberOfChunks > 1 &&
            chunkNumber === numberOfChunks &&
            fileSize !== ((totalSize % chunkSize) + parseInt(chunkSize, 10))) {
            return false;
        }
        if (numberOfChunks === 1 && fileSize !== totalSize) {
            return false;
        }
        return true;
    }

    function validateRequest(chunkNumber, chunkSize, totalSize, identifier, filename, fileSize) {
        // Clean up the identifier
        identifier = cleanIdentifier(identifier);
        var numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1.0)), 1);

        // Check if the request is sane
        if (
            !chunkNumber ||
            !chunkSize ||
            !totalSize ||
            !identifier.length ||
            !filename.length ||
            chunkNumber > numberOfChunks
        ) {
            return false;
        }

        if (typeof(fileSize) !== 'undefined') {
            return validateChunk(
                chunkNumber,
                numberOfChunks,
                fileSize,
                chunkSize,
                totalSize
            );
        }

        return true;
    }

    $.has = function(req, callback) {
        var chunkNumber = parseInt(req.param('flowChunkNumber', 0), 10);
        var chunkSize = parseInt(req.param('flowChunkSize', 0), 10);
        var totalSize = parseInt(req.param('flowTotalSize', 0), 10);
        var identifier = req.param('flowIdentifier', '');
        var filename = req.param('flowFilename', '');

        if (validateRequest(
            chunkNumber,
            chunkSize,
            totalSize,
            identifier,
            filename)
        ) {

            var chunkFilename = getChunkFilename(chunkNumber, identifier);
            fs.exists(chunkFilename, function(exists) {
                if (exists) {
                    callback(true);
                } else {
                    callback();
                }
            });
        } else {
            callback();
        }
    };

    $.post = function(req, callback) {
        var fields = req.body;
        var files = req.files;

        var chunkNumber = parseInt(fields.flowChunkNumber, 10);
        var chunkSize = parseInt(fields.flowChunkSize, 10);
        var totalSize = parseInt(fields.flowTotalSize, 10);
        var identifier = cleanIdentifier(fields.flowIdentifier);
        var filename = fields.flowFilename;

        if (
            !files[$.fileParameterName] ||
            !files[$.fileParameterName].size
        ) {
            return callback(400);
        }

        var originalFilename = files[$.fileParameterName].originalFilename;
        var valid = validateRequest(
            chunkNumber,
            chunkSize,
            totalSize,
            identifier,
            filename,
            files[$.fileParameterName].size
        );
        if (valid) {
            var chunkFilename = getChunkFilename(chunkNumber, identifier);

            // Save the chunk (TODO: OVERWRITE)
            fs.rename(files[$.fileParameterName].path,
            chunkFilename, function() {
                // Do we have all the chunks?
                var currentTestChunk = 1;
                var numberOfChunks = Math.max(
                    Math.floor(totalSize / (chunkSize * 1.0)), 1);

                var testChunkExists = function() {
                    fs.exists(getChunkFilename(currentTestChunk, identifier),
                    function(exists) {
                        if (exists) {
                            currentTestChunk++;
                            if (currentTestChunk > numberOfChunks) {
                                var file = fs.createWriteStream(
                                    './uploads/' + originalFilename
                                );
                                $.write(identifier, file);
                                callback(201);
                            } else {
                                testChunkExists();
                            }
                        } else {
                            callback(202);
                        }
                    });
                };
                testChunkExists();
            });
        } else {
            callback(400);
        }
    };

    // Pipe chunks directly in to an existsing WritableStream
    //   r.write(identifier, response);
    //   r.write(identifier, response, {end:false});
    //
    //   var stream = fs.createWriteStream(filename);
    //   r.write(identifier, stream);
    //   stream.on('data', function(data){...});
    //   stream.on('finish', function(){...});
    $.write = function(identifier, writableStream, options) {
        options = options || {};
        options.end = (typeof options.end === 'undefined' ? true : options.end);

        // Iterate over each chunk
        var pipeChunk = function(number) {
            var chunkFilename = getChunkFilename(number, identifier);
            fs.exists(chunkFilename, function(exists) {
                if (exists) {
                    // If the chunk with the current number exists,
                    // then create a ReadStream from the file
                    // and pipe it to the specified writableStream.
                    var sourceStream = fs.createReadStream(chunkFilename);
                    sourceStream.pipe(writableStream, {
                        end: false
                    });
                    sourceStream.on('end', function() {
                        // When the chunk is fully streamed,
                        // jump to the next one
                        pipeChunk(number + 1);
                    });
                } else {
                    // When all the chunks have been piped, end the stream
                    if (options.end){
                        writableStream.end();
                        $.clean(identifier);
                    }

                    if (options.onDone) options.onDone();
                }
            });
        };
        pipeChunk(1);
    };

    $.clean = function(identifier, options) {
        options = options || {};

        // Iterate over each chunk
        var pipeChunkRm = function(number) {
            var chunkFilename = getChunkFilename(number, identifier);

            fs.exists(chunkFilename, function(exists) {
                if (exists) {
                    fs.unlink(chunkFilename, function(err) {
                        if (err && options.onError) options.onError(err);
                    });

                    pipeChunkRm(number + 1);
                } else if (options.onDone) {
                    options.onDone();
                }
            });
        };
        pipeChunkRm(1);
    };

    return $;
};
