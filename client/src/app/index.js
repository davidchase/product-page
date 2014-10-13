'use strict';

var SingleProductItem = function() {
    this.productDetails =  document.querySelector('.product-details');
    this.queryFromProduct = this.productDetails.querySelector.bind(this.productDetails);
    this.primaryImage = this.queryFromProduct('.primary-image');
    this.swatches = this.queryFromProduct('.swatches');

    this.setupSizesBySwatch();
    this._bindEvents();
};
var SPIProto = SingleProductItem.prototype;

SPIProto.setupSizesBySwatch = function() {
    var selectedSwatch = this.queryFromProduct('.selected');
    var swatchColorCode = selectedSwatch.getAttribute('data-color-code');
    var productSizes = this.queryFromProduct('.product-size');
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


SPIProto.changeProductColors = function(e) {
    var colorCode = e.target.getAttribute('data-color-code');
    var viewCode = e.target.getAttribute('data-view-code');
    var primaryImageArray = this.primaryImage.src.split('_');
    var thumbnails = this.queryFromProduct('.thumbnails');
    var thumbs = thumbnails.children;
    var thumbsLength = thumbs.length;
    var idx = 0;
    var tmp;
    primaryImageArray[1] = colorCode;
    primaryImageArray[2] = viewCode;
    this.primaryImage.src = primaryImageArray.join('_');

    for (idx; idx < thumbsLength; idx++) {
        tmp = thumbs[idx].children[0].src.split('_');
        tmp[1] = colorCode;
        thumbs[idx].children[0].src = tmp.join('_');
    }
};

SPIProto.changeCurrentSwatch = function(e) {
    var swatchesArray = Array.prototype.slice.call(this.swatches.children);
    var currentColor = this.queryFromProduct('.current-color');
    if (e.target.tagName !== 'IMG') {
        return;
    }
    swatchesArray.map(function(swatch) {
        return swatch.classList.remove('selected');
    });
    e.target.classList.add('selected');
    currentColor.textContent = e.target.getAttribute('data-color-name').toLowerCase();
    this.setupSizesBySwatch();
    this.changeProductColors(e);
};


SPIProto.changeImages = function(e) {
    var dataCode = e.target.getAttribute('data-view-code');
    var tempImage;
    if (e.target.tagName !== 'IMG') {
        return;
    }
    tempImage = this.primaryImage.src.slice(0, -1);
    this.primaryImage.src = tempImage + dataCode;
};

SPIProto._bindEvents = function() {
    var thumbnails = this.queryFromProduct('.thumbnails');
    thumbnails.addEventListener('click', this.changeImages.bind(this));
    this.swatches.addEventListener('click', this.changeCurrentSwatch.bind(this));
};



module.exports = new SingleProductItem();