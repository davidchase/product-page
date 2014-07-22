product-page
============

[![Build Status](https://travis-ci.org/davidchase/product-page.svg)](https://travis-ci.org/davidchase/product-page)

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
        │   ├── npm-debug.log
        │   ├── product
        │   │   ├── color-swatch-directive
        │   │   │   ├── color-swatch.tpl.html
        │   │   │   └── index.js
        │   │   ├── index.js
        │   │   ├── product-images-directive
        │   │   │   ├── index.js
        │   │   │   └── product-images.tpl.html
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
    └── routes
        ├── api.js
        └── index.js

Tech Stack
----------
