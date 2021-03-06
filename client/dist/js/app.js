(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
// PDP
require('./product');
// require('./product/productStream');
},{"./product":4}],2:[function(require,module,exports){
'use strict';
// ClassList polyfill made to work with zombie testing
// @todo add support for multiple add and remove of classes
// challenge not to use Regex
var ClassListPoly = function() {};

var CLProto = ClassListPoly.prototype;

CLProto.addClass = function(el, classToAdd) {
    if (el.className.indexOf(classToAdd) > -1) {
        return;
    }
    el.className = el.className += ' ' + classToAdd;
};

CLProto.removeClass = function(el, classToRem) {
    var classes = el && el.className.split(' ');
    var position = classes && classes.indexOf(classToRem);
    if (position === -1 || !position) {
        return;
    }
    classes.splice(position, 1);
    el.className = classes.join(' ');
};

module.exports = new ClassListPoly();
},{}],3:[function(require,module,exports){
'use strict';
var Janitor = function() {};
var JProto = Janitor.prototype;

JProto.preventNonNumericInput = function(e) {
    var key = e.keyCode || e.which;
    // prevent a-z and other non-numeric inputs
    if (key < 48 || key > 57) {
        e.preventDefault();
    }
    // prevent pasting
    if (e.type === 'paste') {
        e.preventDefault();
    }
};

JProto.sanitizeInput = function(el) {
    var adjusted = parseInt(el.value, 10);
    // If value is NaN or eql to 0 then it set to 1
    // otherwise return value
    adjusted = isNaN(adjusted) || adjusted === 0 ? 1 : adjusted;
    el.value = adjusted;
    return el;
};

module.exports = new Janitor();
},{}],4:[function(require,module,exports){
'use strict';

var polyFill = require('../lib/classList');
var janitor = require('../lib/janitor');

var SingleProductItem = function() {
    this.productDetails = document.querySelector('.product-details');
    this.queryFromProduct = this.productDetails.querySelector.bind(this.productDetails);
    this.primaryImage = this.queryFromProduct('.primary-image');
    this.swatches = this.queryFromProduct('.swatches');
    this.thumbnails = this.queryFromProduct('.thumbnails');
    this.sizes = this.queryFromProduct('.product-size');
    this.productOptions = this.queryFromProduct('.product-options');
    this.quantityInput = this.queryFromProduct('.product--quantity');
    this.productButton = this.queryFromProduct('.product--button');

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
        polyFill.addClass(singleProduct[0], 'selected');
        sizeText.textContent = 'Size: ' + singleProduct[0].getAttribute('data-product-size');
        this.productButton.disabled = false;
    }

    // Setup which size buttons
    // are available to which swatch
    for (idx; idx < sizesLength; idx++) {
        if (sizes[idx].getAttribute('data-color-code') === swatchColorCode) {
            polyFill.removeClass(sizes[idx], 'hidden');
        } else {
            polyFill.addClass(sizes[idx], 'hidden');
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
        polyFill.removeClass(thumbs[idx].children[0], 'selected');
    }
    return polyFill.addClass(thumbs[0].children[0], 'selected');
};

SPIProto.changeCurrentSwatch = function(e) {
    var swatchesArray = [].slice.call(this.swatches.children);
    var currentColor = this.queryFromProduct('.current-color');
    if (e.target.nodeName !== 'IMG') {
        return;
    }
    swatchesArray.forEach(function(swatch) {
        return polyFill.removeClass(swatch, 'selected');
    });
    polyFill.addClass(e.target, 'selected');
    currentColor.textContent = e.target.getAttribute('data-color-name').toLowerCase();
    this.setupSizeOptions();
    this.changeProductColors(e);
    this.productButton.disabled = true;
};

SPIProto.changeImages = function(e) {
    var tempImage;
    var thumbnailsArray = [].slice.call(this.thumbnails.children);
    var dataCode = e.target.getAttribute('data-view-code');
    if (e.target.nodeName !== 'IMG') {
        return;
    }
    thumbnailsArray.forEach(function(thumb) {
        return polyFill.removeClass(thumb.children[0], 'selected');
    });
    polyFill.addClass(e.target, 'selected');
    tempImage = this.primaryImage.src.slice(0, -1);
    this.primaryImage.src = tempImage + dataCode;
};

SPIProto.selectSize = function(e) {
    var sizesArray = [].slice.call(this.sizes.children);
    var swatchesArray = [].slice.call(this.swatches.children);
    var sizeText = this.queryFromProduct('.select-size');
    if (e.target.nodeName !== 'BUTTON') {
        return;
    }
    sizeText.textContent = 'Size: ' + e.target.textContent;
    sizesArray.forEach(function(size) {
        polyFill.removeClass(size.children[0], 'selected');
        size.children[0].parentElement.removeAttribute('data-is-selected');
        if (size.children[0].nextElementSibling) {
            polyFill.addClass(size.children[0].nextElementSibling, 'hidden');
        }
        if (e.target.textContent === size.children[0].getAttribute('data-product-size')) {
            if (!size.children[0].disabled) {
                polyFill.addClass(size.children[0], 'selected');
                size.children[0].parentElement.setAttribute('data-is-selected', true);
                return size.children[0].nextElementSibling &&
                    polyFill.removeClass(size.children[0].nextElementSibling, 'hidden');
            }
        }
    });
    swatchesArray.forEach(function(swatch) {
        swatch.setAttribute('data-product-size', e.target.textContent);
    });

    this.productButton.disabled = false;
};

SPIProto.addToBasket = function() {
    var sendObj;
    janitor.sanitizeInput(this.quantityInput);
    sendObj = {
        productId: this.queryFromProduct('.product-id').innerHTML.replace(/\D/ig, ''),
        size: this.sizes.querySelector('.selected').innerHTML,
        quantity: this.quantityInput.value,
        color: this.currentColor.innerHTML
    };
    console.log(sendObj, JSON.stringify(sendObj));
};

SPIProto.checkStockLevel = function() {
    var sizes = this.sizes.getElementsByClassName('sizes');
    var sizesArray = [].slice.call(sizes);
    sizesArray.forEach(function(size) {
        if (size.className.indexOf('hidden') === -1 &&
            size.getAttribute('data-is-disabled') === '' &&
            size.getAttribute('data-is-selected')) {
            this.productButton.disabled = false;
        }
    }.bind(this));
};

SPIProto._bindEvents = function() {
    this.thumbnails.addEventListener('click', this.changeImages.bind(this));
    this.swatches.addEventListener('click', this.changeCurrentSwatch.bind(this));
    this.swatches.addEventListener('click', this.checkStockLevel.bind(this));
    this.sizes.addEventListener('click', this.selectSize.bind(this));
    this.productButton.addEventListener('click', this.addToBasket.bind(this));
    this.quantityInput.addEventListener('keypress', janitor.preventNonNumericInput);
    this.quantityInput.addEventListener('paste', janitor.preventNonNumericInput);
    this.quantityInput.addEventListener('blur', janitor.sanitizeInput.bind(this, this.quantityInput));
};

module.exports = new SingleProductItem();
},{"../lib/classList":2,"../lib/janitor":3}]},{},[1]);
