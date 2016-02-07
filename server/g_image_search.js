var image_urls = require('./data/image_urls.json');
var storage = require('./storage');
var http = require('http');
var url = require('url');

// google-images: https://github.com/vdemedes/google-images
var googleImages = require('google-images');

var CSEKey = process.env.SEARCH_ENGINE_KEY || '004302857253127136025:rq6bsxpxewk';
var APIKey = process.env.GOOGLE_API_KEY || 'AIzaSyD3v2i6B8Uwg83YFv3EdimnT5iLo7VQTwE';
var client = googleImages(CSEKey, APIKey);
// first argument CSE ID, find at https://cse.google.com/cse/setup/basic?cx=004302857253127136025%3Arq6bsxpxewk
// second argument API key, find at https://console.developers.google.com/apis/credentials?project=ggj-jjd

// var google_keyword_lib = ['face', 'horse', 'flower'];
var file_keyword_lib = ['face', 'animal', 'flower', 'food', 'table', 'sofa', 'chair'];

var libraryCalledFunc = null;

function fetch_google_image(image_count) {
    return client.search(getRandomKeyword(google_keyword_lib), {size: 'medium'})
        .then(function (images) {
            /*
            [{
                "url": "http://steveangello.com/boss.jpg",
                "type": "image/jpeg",
                "width": 1024,
                "height": 768,
                "size": 102451,
                "thumbnail": {
                    "url": "http://steveangello.com/thumbnail.jpg",
                    "width": 512,
                    "height": 512
                }
            }]
             */
            // console.log(images)
            // console.log('images.length: ' + images.length)
            var out_image_urls = []
            for (var i=0; i < image_count && images.length; i++) {
                var index = getRandomInt(0, images.length - 1);
                var picked_image = images[index];
                out_image_urls.push(picked_image['url']);
                images.splice(index, 1);
            }
            return out_image_urls;
    })
}

function fetch_image_url_from_file(image_count) {
    var key = null;

    for (var i = 0; i < 1000; ++i) {
        var key = getRandomKeyword(file_keyword_lib)
        if (image_urls.hasOwnProperty(key) && image_urls[key].length >= 4) {
            break;
        }
    }

    var images = image_urls[key].slice();
    var out_image_urls = []
    for (var i = 0; i < image_count && images.length; i++) {
        var index = getRandomInt(0, images.length - 1);
        var picked_image = images[index];
        out_image_urls.push(picked_image);
        images.splice(index, 1);
        console.log('key', key, 'index', index);
    }
    console.log('**********');
    return out_image_urls;
}

function promise_to_fetch_image_url_from_file(image_count) {
    return new Promise(function (resolve, reject) {
        var out_image_urls = fetch_image_url_from_file(image_count);
        resolve(out_image_urls);
    });
    //return Promise.resolve(fetch_image_url_from_file(image_count));
}

//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKeyword(keyword_lib) {
    var index = getRandomInt(0, keyword_lib.length - 1)
    var picked_keyword = keyword_lib[index];
    // console.log('picked_keyword: ' + picked_keyword)
    return picked_keyword;
}

function fetchNewImages() {
    // Find the smallest image listing and make sure more images of that type are fetched.
    var smallest = -1;
    var index = 0;
    for (var i = 0; i < file_keyword_lib.length; ++i) {
        var type = file_keyword_lib[i];
        if (smallest === -1 || image_urls[type].length < smallest) {
            smallest = image_urls[type].length;
            index = i;
        }
    }

    // If we have at least 50 images total in every category, 
    // we can skip fetching. We don't want this to get too large.
    if (smallest >= 50) {
        // Double check all of our urls and then queue this process again.
        checkUrls.then(function() {
            setTimeout(fetchNewImages, 30000);
        }).catch(function(err) {
            console.log(err);
            setTimeout(fetchNewImages, 30000);
        });
        return;
    }

    var type = file_keyword_lib[index];
    console.log('Attempting to fetch new google images for type:', type);
    client.search(type, {
        size: 'medium',
        page: getRandomInt(1, 25)
    }).then(function (images) {
        if (!image_urls.hasOwnProperty(type)) {
            image_urls[type] = [];
        }

        for (var i = 0; i < images.length; ++i) {
            // Make sure we don't push any duplicate entries.
            if (image_urls[type].indexOf(images[i].url) === -1) {
                image_urls[type].push(images[i].url);
            }
        }
    }).then(function() {
        // Check the urls we have just fetched.
        return checkUrlsOfType(type).catch(function(err) {
            console.log(err);
        });
    }).then(function() {
        if (typeof libraryCalledFunc === 'function') {
            libraryCalledFunc(module.exports.getImageCounts());
        }

        console.log('Uploading a new image url set.');
        storage.upload('image_urls.json', JSON.stringify(image_urls)).then(function() {
            // Try fetching new images again later.
            console.log('Upload completed.');
            setTimeout(fetchNewImages, 30000);
        }).catch(function(err) {
            console.log(err);
            console.log('Upload failed, aborting image search process.');
        });
    }).catch(function(err) {
        // Likely if we reach this point, our API key ran its quota.
        console.log('Failed to fetch images');
        setTimeout(fetchNewImages, 30000);
    });
};

function checkUrls() {
    var promises = Promise.resolve();
    for (var type in image_urls) {
        promises = promises.then(function(type) {
            return function(asdf) {
                return checkUrlsOfType(type);
            }
        }(type));
    }
    return promises;
};

function checkUrlsOfType(type) {
    // Remove duplicate links.
    image_urls[type] = image_urls[type].filter(function(item, pos) {
        return image_urls[type].indexOf(item) === pos;
    });

    console.log('Checking images of type:', type, '[count ' + image_urls[type].length + ']');
    return checkUrl(type, 0);
};

function checkUrl(type, index) {
    return new Promise(function(resolve, reject) {
        if (!image_urls[type] || index >= image_urls[type].length) {
            console.log('Finished checking type', type, '[count ' + image_urls[type].length + ']');
            resolve();
        }

        var testUrl = image_urls[type][index];

        // Skip urls that are binary
        if (testUrl.indexOf('data:image') > -1 || testUrl.indexOf('.gif') > -1) {
            // console.log('url type:', type + '[' + index + '] - is binary');
            // Now attempt to check the next URL index from the same type.
            checkUrl(type, index+1).then(function() {
                resolve();
            }).catch(function(err) {
                console.log(err);
                resolve();
            });
            return;
        }

        // console.log('checking url type:', type + '[' + index + '] -', testUrl);
        var urlData = url.parse(testUrl);
        // console.log(' urlData:', urlData);
        var options = {
            method: 'HEAD',
            // protocol: urlData.protocol,
            hostname: urlData.hostname,
            port: 80,
            path: urlData.path
        };
        var req = http.request(options, function(res) {
            // console.log(res);
            // If we get a valid URL, increment the index.
            if (res.statusCode === 200) {
                index += 1;
            } else {
                // This URL failed, remove it.
                image_urls[type].splice(index, 1);
                // console.log('-- removing');
            }

            // Now attempt to check the next URL index from the same type.
            checkUrl(type, index).then(function() {
                resolve();
            }).catch(function(err) {
                console.log(err);
                resolve();
            });
        });
        req.on('error', function(err) {
            console.log(err);
            resolve();
        });
        req.end();
    });
};

//module.exports.init = fetch_google_image;
// module.exports.promiseImages = promise_to_fetch_image_url_from_file;
module.exports.provideImages = fetch_image_url_from_file;

// The Image searcher will occasionally attempt to fetch new images from Google.
module.exports.init = function() {
    // Initialize the S3 storage system first.
    return storage.init().then(function() {
        // The first thing to do is attempt to load any current data in storage.
        return storage.item('image_urls.json').then(function(item) {
            image_urls = JSON.parse(item.Body.toString());
            console.log('image_urls.json data found and loaded.');
        }).catch(function(err) {
            // If we get an error, the file doesn't exist or we have no access to it.
            // Oh well, we can just stick with our fallback image url list.
            console.log('Could not fetch image_urls.json data, skipping...');
        }).then(function() {
            // We'll watch to check and make sure the image url's are still valid, then
            // attempt to fetch new images continuously.
            checkUrls().then(function() {
                fetchNewImages();
            });
        });
    });
};

module.exports.on_library_changed = function(callback) {
    libraryCalledFunc = callback;
};

module.exports.getImageCounts = function() {
    var imageCounts = {};
    for (var type in image_urls) {
        imageCounts[type] = image_urls[type].length;
    }
    return imageCounts;
}


// ***********************************
// * insturctions:
// * call below codes to get the image url
// ***********************************
// var g_image_search = require('./server/g_image_search');

// g_image_search.init(4).then(function (image_url)
//     {
//         console.log('image url: ' + image_url)
//     }
// );
