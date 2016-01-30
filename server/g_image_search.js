var googleImages = require('google-images');

var client = googleImages('004302857253127136025:rq6bsxpxewk', 'AIzaSyDflroT2mavSH8VC_0MWfR091gm0-H3ycM');
// first argument CSE ID, find at https://cse.google.com/cse/setup/basic?cx=004302857253127136025%3Arq6bsxpxewk
// second argument API key, find at https://console.developers.google.com/apis/credentials?project=ggj-jjd

client.search('Steve Angello')
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
        index = getRandomInt(0, 9)
        console.log('random index ' + index)
        picked_image = images[index]
        console.log(picked_image)
    });

//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}