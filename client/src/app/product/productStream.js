'use strict';
var stream = require('most');

var isImage = function(e) {
    return e.target.nodeName === 'IMG';
};
var noop = function() {
    // no operations here
};

var thumbnails = document.querySelector('.thumbnails');
var primaryImage = document.querySelector('.primary-image');
var thumbnailsStream = stream.fromEventWhere(isImage, 'click', thumbnails);
var swatches = document.querySelector('.swatches');
var swatchesStream = stream.fromEventWhere(isImage, 'click', swatches);
var imagesStream = stream.from(document.getElementsByClassName('image'));
var sizesStream = stream.from(document.getElementsByClassName('sizes'));
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

swatchesStream
    .map(function(e) {
        var swatch = e.target;
        swatch
            .parentNode
            .querySelector('.selected')
            .classList
            .remove('selected');
        swatch
            .classList
            .add('selected');
        return swatch;
    })
    .map(function(swatch) {
        var arr = [];
        var dataColorCode = swatch.getAttribute('data-color-code'); 
        var dataColorName = swatch.getAttribute('data-color-name');
        arr.push(dataColorCode, dataColorName, swatch);
        return arr;
    })
    .observe(function(array) {
        array[2]
            .parentNode
            .previousElementSibling
            .querySelector('.current-color')
            .textContent = array[1].toLowerCase();

        primaryImage.src = primaryImage.src.replace(/_\d*_/, '_' + array[0] + '_');

        imagesStream.map(function(img) {
            img.src = img.src.replace(/_\d*_/, '_' + array[0] + '_');
        }).drain();
    });
sizesStream
    .map(function(size) {
        var selectedProduct = swatches.querySelector('.selected');
        var selectedCode = selectedProduct.getAttribute('data-color-code');

        if (size.getAttribute('data-color-code') === selectedCode) {
            size.classList.remove('hidden');
        } else {
            size.classList.add('hidden');
        }
    }).drain();