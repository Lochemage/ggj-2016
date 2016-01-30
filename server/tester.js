var Mocha = require('mocha');
var fs = require('fs');
var path = require('path');

var mocha = new Mocha();

/**
 * Runs the test.
 *
 * @function module:server/tester#run
 * @returns {module:promise~Object} - A promise for asyncronous initialization.
 */
module.exports.run = function(specificTest) {
  var files = fs.readdirSync(path.join(__dirname, 'tests'));

  console.log("Running unit tests...");

  for (var i = 0; i < files.length; ++i) {
    if (files[i].indexOf('.js') === files[i].length - 3) {
      if (!specificTest || files[i].replace('test-', '').replace('.js', '') === specificTest) {
        mocha.addFile(path.join(__dirname, 'tests', files[i]));
      }
    }
  }

  return new Promise(function(resolve, reject) {
    mocha.run(function(failures) {
      if (failures) {
        reject(failures);
      } else {
        resolve();
      }
    });
  });
};