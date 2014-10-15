'use strict';
var browser = new Zombie({
    debug: true
});
setup(function(done) {
    browser.visit('http://monkeybusiness.ngrok.com/').then(done);
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

test('randomly clicking a thumbnail will change the main image', function() {
    var thumbnail = browser.queryAll('.image')[Math.floor(Math.random() * 4) + 1];
    var viewCode = thumbnail.getAttribute('data-view-code');
    browser.fire(thumbnail, 'click', function() {
        var primaryImage = browser.query('.primary-image');
        primaryImage.src.indexOf(viewCode).should.not.eql(-1);
        primaryImage.src.split('_')[2].should.eql(viewCode);
    });
});

test('selecting a product size enables add product button', function() {
    browser.pressButton('XS', function() {
        var productBtn = browser.query('.product--button');
        return productBtn.disabled.should.be.false;
    });
});

test('inputing a non-numeric value, will result in input eql 1', function() {
    browser.pressButton('XS');
    browser
        .fill('.product--quantity', '00')
        .pressButton('Add to Basket', function() {
            var input = browser.query('.product--quantity');
            input.value.should.eql(1);
        });
});

test('inputing a valid number should eql itself', function() {
    browser.pressButton('XS');
    browser
        .fill('.product--quantity', 9)
        .pressButton('Add to Basket', function() {
            var input = browser.query('.product--quantity');
            input.value.should.eql(9);
        });
});

test('inputing an octal number should strip the leading 0', function() {
    browser.pressButton('XS');
    browser
        .fill('.product--quantity', '07')
        .pressButton('Add to Basket', function() {
            var input = browser.query('.product--quantity');
            input.value.should.eql(7);
        });
});