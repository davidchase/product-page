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
var changeCurrentSwatch = function() {
    var swatches = document.querySelector('.swatches');
    var swatchesArray = Array.prototype.slice.call(swatches.children);
    swatches.addEventListener('click', function(e) {
        if (e.target.tagName !== 'IMG') {
            return;
        }
        swatchesArray.map(function(swatch){
            return swatch.classList.remove('selected');
        });
        e.target.classList.add('selected');
        setupSizesBySwatch();
    });
};

setupSizesBySwatch();
changeCurrentSwatch();