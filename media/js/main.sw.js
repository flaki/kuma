/* jshint node: true */
/* global self */
'use strict';


// Caching polyfill /polyfills .add()/.addAll() methods on opened cache objects/
// via https://github.com/coonsta/cache-polyfill
self.importScripts('libs/sw-caches-polyfill.js');


// Files to be cached
// STATIC cache should come inlined, while documentation urls should be loaded
// from an API or something similar facility
var CACHE_STATIC = 'mdn-static';
var urlsStatic = [
  '//mozorg.cdn.mozilla.net/media/css/tabzilla-min.css',
  '//mozorg.cdn.mozilla.net/media/img/tabzilla/tab.png',

  '/media/css/font-awesome.css?build=1427570753',
  '/media/css/main.css?build=1427570753',
  '/media/css/badges.css?build=1427570753',
  '/media/css/wiki.css?build=1427570753',
  '/media/css/zones.css?build=1427570753',
  '/media/css/diff.css?build=1427570753',

  '/media/js/libs/prism/themes/prism.css?build=1427469741',
  '/media/js/libs/prism/plugins/line-highlight/prism-line-highlight.css?build=1427469741',
  '/media/js/libs/prism/plugins/ie8/prism-ie8.css?build=1427469741',

  '/media/js/prism-mdn/plugins/line-numbering/prism-line-numbering.css?build=1427469741',
  '/media/js/prism-mdn/components/prism-json.css?build=1427469741',

  '/media/css/wiki-syntax.css?build=1427570753',

  '/en-US/jsi18n/build:dev',

  //'https://login.persona.org/include.js', not served w/ CORS headers

  '/media/js/libs/jquery-2.1.0.js?build=1427469741',
  '/media/js/components.js?build=1427469741',
  '/media/js/analytics.js?build=1427469741',
  '/media/js/main.js?build=1427469741',
  '/media/js/auth.js?build=1427469741',
  '/media/js/badges.js?build=1427469741',
  '/media/js/social.js?build=1427469741',

  '/media/js/search-navigator.js?build=1427469741',
  '/media/js/wiki.js?build=1427469741',

  '/media/js/save-for-offline.js',

  '/media/img/header-background.png',
  '/media/img/logo_sprite.svg?2014-01'
];

var CACHE_DOCS = 'mdn-docs';
var urlsDocs = [
  '/en-US/docs/Web/Reference/API',
  '/en-US/docs/DOM',
  '/en-US/docs/DOM/DOM_Reference/Introduction',
  '/en-US/docs/WebAPI/Using_Light_Events'
];

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...', event);

  // Perform install steps
  // Install is finished when both static & docs cache is populated
//  event.waitUntil(
//  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activated!');

  event.waitUntil(
    self.caches.open(CACHE_STATIC).then(function(c) {
      console.log('Opened mdn-static cache', c);

      return c.addAll(urlsStatic);
    }).then(function() {
      console.log('Caching of static resources finished.');
    }).catch(function(error) {
      console.log('Caching failed for static resources!', error);
    })
  );
});


self.addEventListener('message', function(event) {
  console.log('Caching requested: ', event);

  populateCaches();
});


function populateCaches() {
  // Open both cache storages
  return Promise.all([
    self.caches.open(CACHE_STATIC),
    self.caches.open(CACHE_DOCS)

  // Save urls to respective caches
  ]).then(function(cacheList) {
      console.log('Opened caches mdn-static & mdn-docs', cacheList);

      return Promise.all([
        cacheList[0].addAll(urlsStatic),
        cacheList[1].addAll(urlsDocs)
      ]);

  // Caching done
  }).then(function() {
    console.log('Caches populated successfully');

  // Caching failed
  }).catch(function(err) {
    console.log('Failed to populate caches! Error: ' + err);

  });
}
