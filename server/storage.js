/**
 * S3 Storage management module.
 *
 * @module server/storage
 * @requires aws-sdk
 * @requires fs
 * @requires crypto
 */
var aws     = require('aws-sdk');
var crypto  = require('crypto');

/**
 * Initializes the S3 storage manager
 * @function module:server/storage#init
 * @returns {Promise} - A promise for asyncronous initialization.
 */
module.exports.init = function() {
  var _storage = null;
  var _storageSpacer = null;

  // Establish a storage connection.
  var promise = Promise.resolve();
  promise = promise.then(function() {
    console.log("Initializing Storage Manager");
  });

  promise = promise.then(function() {
    var creds = {
      accessKeyId: process.env.STORAGE_KEY || 'AKIAJFA4YE45NYRVEFHQ',
      secretAccessKey: process.env.STORAGE_SECRET_KEY || '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',
      sslEnabled: true
    };
    console.log(creds);
    aws.config.update(creds);
    _storage = new aws.S3();
  });

  /**
   * Lists all objects in a given storage path.<br>
   * An object is a data structure containing aws object info.
   * @function module:server/storage#listObjects
   * @param {String} path - The path to the folder to list items for.
   * @param {Boolean} [subFolders] - If true, all objects in all sub folders will also be included.
   * @returns {Promise.<Object[]>} - A promise object that retrieves the item list.
   */
  module.exports.listObjects = function(path, subFolders) {
    function __listObjects(prefix, marker) {
      return new Promise(function(resolve, reject) {
        var params = {
          Bucket: 'telepicto',
          Prefix: prefix
        };

        if (marker) {
          params.Marker = marker;
        }

        if (!subFolders) {
          params.Delimiter = '/';
        }

        _storage.listObjects(params, function(err, data) {
          if (err) {
            return reject(err);
          }

          marker = null;
          var list = data.Contents;

          if (data.IsTruncated) {
            marker = data.NextMarker || (data.Contents.length? data.Contents[data.Contents.length-1].Key: undefined);
          }

          if (!marker) {
            return resolve(list);
          }

          __listObjects(path, marker).then(function(nextList) {
            resolve(list.concat(nextList));
          }).catch(function(err) {
            reject(err);
          });
        });
      }).then(function(objects) {
        // If our object list is empty and we are not including sub folders, try again if our prefix path did not end with a '/'
        if (!objects.length && path && !subFolders && path.lastIndexOf('/') !== path.length-1 && path.lastIndexOf("\\") !== path.length-1) {
          path = path + '/';
          return __listObjects(path);
        }
        return objects;
      });
    };

    return __listObjects(path);
  };

  /**
   * Lists all items in a given storage path by their key names.
   * @function module:server/storage#listItems
   * @param {String} path - The path to the folder to list items for.
   * @param {Boolean} [subFolders] - If true, all items in all sub folders will also be included.
   * @returns {Promise.<Object[]>} - A promise object that retrieves the item list.
   */
  module.exports.listItems = function(path, subFolder) {
    return this.listObjects(path, subFolder).then(function(objects) {
      // An item is an object that has a size.
      var result = [];
      for (var i = 0; i < objects.length; ++i) {
        result.push(objects[i].Key);
      }
      return result;
    });
  };

  /**
   * Lists all folders found within a given storage path.
   * @function module:server/storage#listFolders
   * @param {String} path - The path to list folders for.
   * @returns {Promise.<String[]>} - A promise object that retrieves the folder list.
   */
  module.exports.listFolders = function(path) {
    function __listObjects(prefix, marker) {
      return new Promise(function(resolve, reject) {
        var params = {
          Bucket: 'telepicto',
          Prefix: prefix,
          Delimiter: '/'
        };

        if (marker) {
          params.Marker = marker;
        }

        _storage.listObjects(params, function(err, data) {
          if (err) {
            return reject(err);
          }

          marker = null;
          var list = [];

          if (data.CommonPrefixes) {
            for (var i = 0; i < data.CommonPrefixes.length; ++i) {
              list.push(data.CommonPrefixes[i].Prefix.substring(prefix.length, data.CommonPrefixes[i].Prefix.length-1));
            }
          }

          if (data.IsTruncated) {
            marker = data.NextMarker || (data.Contents.length? data.Contents[data.Contents.length-1].Key: undefined);
          }

          if (!marker) {
            return resolve(list);
          }

          __listObjects(path, marker).then(function(nextList) {
            resolve(list.concat(nextList));
          }).catch(function(err) {
            reject(err);
          });
        });
      });
    };

    if (path.lastIndexOf('/') !== path.length-1 && path.lastIndexOf("\\") !== path.length-1) {
      path = path + '/';
    }
    return __listObjects(path);
  };

  /**
   * Retrieves the data for an item.
   * @function module:server/storage#item
   * @param {String} itemName - THe items path to download.
   * @returns {Promise.<Object>} - A promise object that retrieves the contents of the item.
   */
  module.exports.item = function(itemName) {
    return new Promise(function(resolve, reject) {
      _storage.getObject({
        Bucket: 'telepicto',
        Key: itemName
      }, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * Uploads an item to storage.
   * @function module:server/storage#upload
   * @param {String} itemName - The items path to upload.
   * @param {String} data - The items file data.
   * @returns {Promise.<String>} - A promise object that retrieves the upload result.
   */
  module.exports.upload = function(itemName, data) {
    return new Promise(function(resolve, reject) {
      if (!data) {
        reject('Attempted to upload to storage when no data was provided!');
        return;
      }

      _storage.upload({
        Bucket: 'telepicto',
        Key: itemName,
        Body: data,
        ACL: 'public-read'
      }, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  /**
   * Uploads an item encoded in base64 format to storage.
   * @function module:server/storage#upload64
   * @param {String} itemName - The items path to upload.
   * @param {String} data - The base64 encoded items data.
   * @returns {Promise.<String>} - A promise object that retrieves the upload result.
   */
  module.exports.upload64 = function(itemName, data) {
    return new Promise(function(resolve, reject) {
      if (!data) {
        reject('Attempted to upload to storage when no data was provided!');
        return;
      }

      _storage.upload({
        Bucket: 'telepicto',
        Key: itemName,
        Body: new Buffer(data.substring(data.indexOf(',')), 'base64'),
        ACL: 'public-read'
      }, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  /**
   * Remove all objects within a given storage path.
   * @function module:server/storage#remove
   * @param {String} path - The path to remove.
   * @param {Boolean} [subFolders] - If true, all items in all sub folders will also be deleted.
   * @returns {Promise} - A promise object.
   */
  module.exports.remove = function(path, subFolders) {
    return this.listObjects(path, subFolders).then(function(objects) {
      var list = [];
      for (var i = objects.length-1; i >= 0; --i) {
        list.push({Key: objects[i].Key});
      }

      return new Promise(function(resolve, reject) {
        _storage.deleteObjects({
          Bucket: 'telepicto',
          Delete: {
            Objects: list
          }
        }, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
  };

  /**
   * Compares two files for sameness.
   * @function module:server/storage#compare
   * @param {String} fileA - The path to the first file to compare.
   * @param {String} fileB - The path to the second file to compare.
   * @returns {Promise.<Boolean>} - A promise with the result.
   */
  module.exports.compare = function(fileA, fileB) {
    var pathA = 'https:' + this.itemUrl(fileA);
    var pathB = 'https:' + this.itemUrl(fileB);

    function __getHash(key) {
      return new Promise(function(resolve, reject) {
        var md5sum = crypto.createHash('md5');

        _storage.getObject({
          Bucket: 'telepicto',
          Key: key
        }).on('httpData', function(data) {
          md5sum.update(data);
        }).on('httpDone', function() {
          var hash = md5sum.digest('hex');
          resolve(hash);
        }).on('httpError', function(err) {
          reject(err);
        }).send();
      });
    };

    // First compare the size of each file, as it is quicker than pulling each files contents.
    var sizes = [];
    return Promise.all([
      this.listObjects(fileA).then(function(objects) {
        for (var i = 0; i < objects.length; ++i) {
          if (objects[i].Key === fileA) {
            sizes[0] = objects[i].Size;
            return;
          }
        }
        sizes[0] = -1;
      }),
      this.listObjects(fileB).then(function(objects) {
        for (var i = 0; i < objects.length; ++i) {
          if (objects[i].Key === fileB) {
            sizes[1] = objects[i].Size;
            return;
          }
        }
        sizes[1] = -1;
      })
    ]).then(function() {
      if (sizes[0] > -1 && sizes[1] > -1 && sizes[0] === sizes[1]) {
        // Sizes match, now do a more detailed check by comparing their contents.
        var hashes = [];
        return Promise.all([
          __getHash(fileA).then(function(hash) {
            hashes[0] = hash;
          }),
          __getHash(fileB).then(function(hash) {
            hashes[1] = hash;
          })
        ]).then(function() {
          if (hashes[0] === hashes[1]) {
            return true;
          }
          return false;
        });
      } else {
        return false;
      }
    });
  };

  promise = promise.then(function() {
    console.log('Storage Manager initialized!\n');
  });

  return promise;
}
