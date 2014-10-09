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
var changeImages = function(e){
    var colorCode = e.target.getAttribute('data-color-code');
    var primaryImage = document.querySelector('.primary-image');
    var primaryImageArray = primaryImage.src.split('_');
    primaryImageArray[1] = colorCode;
    primaryImage.src = primaryImageArray.join('_');
};

var changeCurrentSwatch = function() {
    var swatches = document.querySelector('.swatches');
    var swatchesArray = Array.prototype.slice.call(swatches.children);
    var currentColor = document.querySelector('.current-color');

    swatches.addEventListener('click', function(e) {
        if (e.target.tagName !== 'IMG') {
            return;
        }
        swatchesArray.map(function(swatch){
            return swatch.classList.remove('selected');
        });
        e.target.classList.add('selected');
        currentColor.textContent = e.target.getAttribute('data-color-name').toLowerCase();
        setupSizesBySwatch();
        changeImages(e);
    });
};



setupSizesBySwatch();
changeCurrentSwatch();