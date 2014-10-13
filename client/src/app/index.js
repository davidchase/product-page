'use strict';

var SingleProductItem = function() {
    this.productDetails = document.querySelector('.product-details');
    this.queryFromProduct = this.productDetails.querySelector.bind(this.productDetails);
    this.primaryImage = this.queryFromProduct('.primary-image');
    this.swatches = this.queryFromProduct('.swatches');
    this.thumbnails = this.queryFromProduct('.thumbnails');
    this.sizes = this.queryFromProduct('.product-size');

    this.setupSizesBySwatch();
    this._bindEvents();
};
var SPIProto = SingleProductItem.prototype;


SPIProto.setupSizesBySwatch = function() {
    var productOptions = this.queryFromProduct('.product-options');
    var selectedSwatch = productOptions.querySelector('.selected');
    var swatchColorCode = selectedSwatch.getAttribute('data-color-code');
    var swatchName = selectedSwatch.getAttribute('data-color-name');
    var currentColor = this.queryFromProduct('.current-color');
    var productSizes = this.queryFromProduct('.product-size');
    var sizes = productSizes.children;
    var idx = 0;
    var sizesLength = sizes.length;

    currentColor.textContent = swatchName.toLowerCase();
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
    var swatchesArray = [].slice.call(this.swatches.children);
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
    var thumbnailsArray = [].slice.call(this.thumbnails.children);
    var dataCode = e.target.getAttribute('data-view-code');
    var tempImage;
    if (e.target.tagName !== 'IMG') {
        return;
    }
    thumbnailsArray.map(function(thumb) {
        return thumb.children[0].classList.remove('selected');
    });
    e.target.classList.add('selected');
    tempImage = this.primaryImage.src.slice(0, -1);
    this.primaryImage.src = tempImage + dataCode;
};

SPIProto.selectSize = function(e) {
    var sizesArray = [].slice.call(this.sizes.children);
    var swatchesArray = [].slice.call(this.swatches.children);
    var basketButton = this.queryFromProduct('.product--button');
    if (e.target.tagName !== 'BUTTON') {
        return;
    }
    sizesArray.map(function(size) {
        size.children[0].classList.remove('selected');
        if (size.children[0].nextElementSibling) {
            size.children[0].nextElementSibling.classList.add('hidden');
        }
        if (e.target.getAttribute('data-product-size') === size.children[0].getAttribute('data-product-size')) {
                size.children[0].classList.add('selected');
        }
    });
    swatchesArray.map(function(swatch) {
        swatch.setAttribute('data-product-size', e.target.textContent);
    });

    if (e.target.nextElementSibling) {
        e.target.nextElementSibling.classList.remove('hidden');
    }
    basketButton.removeAttribute('disabled');
};

SPIProto._bindEvents = function() {
    this.thumbnails.addEventListener('click', this.changeImages.bind(this));
    this.swatches.addEventListener('click', this.changeCurrentSwatch.bind(this));
    this.sizes.addEventListener('click', this.selectSize.bind(this));
};



module.exports = new SingleProductItem();