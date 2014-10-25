'use strict';
var stream = require('most');

var isImage = function(e) {
    return e.target.nodeName === 'IMG';
};
var thumbnails = document.querySelector('.thumbnails');
var primaryImage = document.querySelector('.primary-image');
var thumbnailsStream = stream.fromEventWhere(isImage, 'click', thumbnails);
thumbnailsStream
    .map(function(e) {
        var image = e.target;
        image
            .parentNode
            .parentNode
            .querySelector('.selected')
            .classList
            .remove('selected');
        image
            .classList
            .add('selected');
        return image.getAttribute('data-view-code');
    })
    .observe(function(dataCode) {
        primaryImage.src = primaryImage.src.replace(/\w$/, '') + dataCode;
        return primaryImage;
    });