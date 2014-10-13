'use strict';

var SingleProductItem = function() {
    this.productDetails = document.querySelector('.product-details');
    this.queryFromProduct = this.productDetails.querySelector.bind(this.productDetails);
    this.primaryImage = this.queryFromProduct('.primary-image');
    this.swatches = this.queryFromProduct('.swatches');
    this.thumbnails = this.queryFromProduct('.thumbnails');
    this.sizes = this.queryFromProduct('.product-size');
    this.productOptions = this.queryFromProduct('.product-options');


    // Init
    this.setupSizeOptions();
    this.setupCurrentColor();
    this._bindEvents();
};
var SPIProto = SingleProductItem.prototype;

SPIProto.setupCurrentColor = function() {
    var selectedSwatch = this.productOptions.querySelector('.selected');
    this.swatchName = selectedSwatch.getAttribute('data-color-name');
    this.currentColor = this.queryFromProduct('.current-color');
    this.currentColor.textContent = this.swatchName.toLowerCase();
    return this.currentColor;
};

SPIProto.setupSizeOptions = function() {
    var selectedSwatch = this.productOptions.querySelector('.selected');
    var swatchColorCode = selectedSwatch.getAttribute('data-color-code');
    var sizeText = this.queryFromProduct('.select-size');
    var idx = 0;
    var sizes = this.sizes.children;
    var sizesLength = sizes.length;

    // Get the size buttons
    // filter and get the one not disabled
    // if only one button is not disabled make
    // select it for the user...
    var singleProduct = [];
    var buttons = this.sizes.getElementsByTagName('button');
    buttons = [].slice.call(buttons);
    singleProduct = buttons.filter(function(button) {
        return button.disabled === false;
    });
    if (singleProduct.length === 1) {
        singleProduct[0].classList.add('selected');
        sizeText.textContent = 'Size: ' + singleProduct[0].getAttribute('data-product-size');
    }

    // Setup which size buttons
    // are available to which swatch
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
    var tmp;
    var idx = 0;
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
    this.setupSizeOptions();
    this.changeProductColors(e);
};

SPIProto.changeImages = function(e) {
    var tempImage;
    var thumbnailsArray = [].slice.call(this.thumbnails.children);
    var dataCode = e.target.getAttribute('data-view-code');
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
    var sizeText = this.queryFromProduct('.select-size');
    var basketButton = this.queryFromProduct('.product--button');
    if (e.target.tagName !== 'BUTTON') {
        return;
    }
    sizeText.textContent = 'Size: ' + e.target.textContent;
    sizesArray.map(function(size) {
        size.children[0].classList.remove('selected');
        if (size.children[0].nextElementSibling) {
            size.children[0].nextElementSibling.classList.add('hidden');
        }
        if (e.target.textContent === size.children[0].getAttribute('data-product-size')) {
            if (!size.children[0].disabled) {
                size.children[0].classList.add('selected');
            }
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