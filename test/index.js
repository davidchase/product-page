'use strict';
var Browser = require('zombie');
var should = require('should');

setup(function() {
    this.browser = Browser.create();
    this.browser.visit('http://localhost:9000')
        .then(function(done) {
            done();
        });
    this.browser.on('error', function(error) {
        console.error('Something went wrong: ' + error);
    });
});

test('browser should connect', function() {
    return this.browser.should.be.ok;
});

test('should have one primary image', function() {
    var image = this.browser.query('.primary-image');
    should(image.length).eql(1);
});