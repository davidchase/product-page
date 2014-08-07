product-page
============

[![Build Status][travis-image]][travis-url]
[![devDependency Status][devdeps-image]][devdeps-url]

Angular based product-page

Current Structure
---------
    client
    ├── dist
    │   ├── css
    │   │   ├── reset.css
    │   │   └── style.css
    │   └── js
    │       ├── app.js
    │       └── vendor-bundle.js
    ├── index.html
    └── src
       ├── app
       │   ├── index.js
       │   ├── product
       │   │   ├── index.js
       │   │   ├── product-images-directive
       │   │   │   ├── index.js
       │   │   │   └── product-images.tpl.html
       │   │   ├── product-options-directive
       │   │   │   ├── index.js
       │   │   │   └── product-options.tpl.html
       │   │   ├── productCtrl.js
       │   │   └── productService.js
       │   └── suggestions
       │       └── index.js
       ├── common
       │   ├── directives
       │   ├── filters
       │   │   └── capitalizeFilter.js
       │   └── services
       └── scss
           └── style.scss

    server
    ├── fixtures.json

Tech Stack
----------
* Browserify
* ~~Express v4~~ Hapi v6.4.0
* Gulp
* Angular*
* Karma Test Runner
* Mocha Test Suite

<sub>*Current setup for front-end, may change...</sub>
[travis-image]: http://img.shields.io/travis/davidchase/product-page.svg?style=flat
[travis-url]: https://travis-ci.org/davidchase/product-page
[devdeps-image]: http://img.shields.io/david/dev/davidchase/product-page.svg?style=flat
[devdeps-url]:https://david-dm.org/davidchase/product-page#info=devDependencies