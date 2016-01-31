// google-images: https://github.com/vdemedes/google-images
var googleImages = require('google-images');

var client = googleImages('004302857253127136025:rq6bsxpxewk', 'AIzaSyDflroT2mavSH8VC_0MWfR091gm0-H3ycM');
// first argument CSE ID, find at https://cse.google.com/cse/setup/basic?cx=004302857253127136025%3Arq6bsxpxewk
// second argument API key, find at https://console.developers.google.com/apis/credentials?project=ggj-jjd

var keyword_lib = ['face', 'horse', 'flower']

module.exports.init = function fetch_google_image(image_count) {
    return client.search(getRandomKeyword(), {size: 'medium'})
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
            image_urls = []
            for (var i=0; i < image_count && images.length; i++) {
                var index = getRandomInt(0, images.length - 1);
                var picked_image = images[index];
                image_urls.push(picked_image['url'])
                images.splice(index, 1);
            }
            return image_urls;
    })
}
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKeyword() {
    var index = getRandomInt(0, keyword_lib.length - 1)
    var picked_keyword = keyword_lib[index];
    // console.log('picked_keyword: ' + picked_keyword)
    return picked_keyword;
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