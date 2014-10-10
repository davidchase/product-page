'use strict';

var setupSizesBySwatch = function() {
    var selectedSwatch = document.querySelector('.selected');
    var swatchColorCode = selectedSwatch.getAttribute('data-color-code');
    var productSizes = document.querySelector('.product-size');
    var sizes = productSizes.children;
    var idx = 0;
    var sizesLength = sizes.length;

    for (idx; idx < sizesLength; idx++) {
        if (sizes[idx].getAttribute('data-color-code') === swatchColorCode) {
            sizes[idx].classList.remove('hidden');
        } else {
            sizes[idx].classList.add('hidden');
        }
    }
};


var changeProductColors = function(e) {
    var colorCode = e.target.getAttribute('data-color-code');
    var primaryImage = document.querySelector('.primary-image');
    var primaryImageArray = primaryImage.src.split('_');
    var thumbnails = document.querySelector('.thumbnails');
    var thumbs = thumbnails.children;
    var thumbsLength = thumbs.length;
    var idx = 0;
    var tmp;
    primaryImageArray[1] = colorCode;
    primaryImage.src = primaryImageArray.join('_');

    for (idx; idx < thumbsLength; idx++) {
        tmp = thumbs[idx].children[0].src.split('_');
        tmp[1] = colorCode;
        thumbs[idx].children[0].src = tmp.join('_');
    }
};

var changeCurrentSwatch = function() {
    var swatches = document.querySelector('.swatches');
    var swatchesArray = Array.prototype.slice.call(swatches.children);
    var currentColor = document.querySelector('.current-color');

    swatches.addEventListener('click', function(e) {
        if (e.target.tagName !== 'IMG') {
            return;
        }
        swatchesArray.map(function(swatch) {
            return swatch.classList.remove('selected');
        });
        e.target.classList.add('selected');
        currentColor.textContent = e.target.getAttribute('data-color-name').toLowerCase();
        setupSizesBySwatch();
        changeProductColors(e);
    });
};


var changeImages = function() {
    var thumbnails = document.querySelector('.thumbnails');
    var primaryImage = document.querySelector('.primary-image');
    thumbnails.addEventListener('click', function(e) {
        var dataCode = e.target.getAttribute('data-view-code');
        var tempImage;
        if (e.target.tagName !== 'IMG') {
            return;
        }
        tempImage = primaryImage.src.slice(0, -1);
        primaryImage.src = tempImage + dataCode;
    });
};



setupSizesBySwatch();
changeCurrentSwatch();
changeImages();