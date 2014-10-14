'use strict';
var Zombie = require('zombie');
var browser = new Zombie({
    debug: true
});
setup(function(done) {
    browser.visit('http://localhost:9000').then(done);
    browser.on('error', function(err) {
        console.dir(err);
    });
});

test('clicking swatch changes primary image', function() {
    var swatch = browser.queryAll('.swatch-button')[1];
    browser.fire(swatch, 'click', function() {
        var primaryImage = browser.query('.primary-image');
        primaryImage.src.indexOf(50).should.not.eql(-1);
    });
});

test('clicking swatch changes current color', function() {
    var swatch = browser.queryAll('.swatch-button')[1];
    browser.fire(swatch, 'click', function() {
        var currentColor = browser.query('.current-color');
        currentColor.textContent.should.eql('violet');
    });
});

test('selecting a product size enables add product button', function() {
    browser.pressButton('XS', function() {
        var productBtn = browser.query('.product--button');
        return productBtn.disabled.should.be.false;
    });
});