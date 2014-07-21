  'use strict';
  var $compile, $rootScope;

  setup(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
  }));

  test("should load the directive template", function() {
      var element = $compile('<div data-product-images></div>')($rootScope);
      $rootScope.$digest();
      element.html().should.containEql('<div class="main-product">');
  });