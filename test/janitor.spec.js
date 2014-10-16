var janitor = require('../client/src/app/lib/janitor');

test('inputting in a number starting with 0 should strip leading 0', function() {
    var result = janitor.sanitizeInput({
        value: '09'
    });
    result.value.should.eql(9);
});

test('inputting in a string should eql to 1', function() {
    var result = janitor.sanitizeInput({
        value: 'something that doesn\'t belong'
    });
    result.value.should.eql(1);
});

test('inputting in a valid number should eql itself', function() {
    var result = janitor.sanitizeInput({
        value: '10'
    });
    result.value.should.eql(10);
});

test('inputting in an object should eql to 1', function() {
    var result = janitor.sanitizeInput({
        value: {}
    });
    result.value.should.eql(1);
});