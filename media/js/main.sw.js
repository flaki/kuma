/* jshint worker: true, globalstrict: true */
/* global self, caches, fetch */
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

  '/media/css/font-awesome.css?build=1427671832',
  '/media/css/main.css?build=1427671832',
  '/media/css/badges.css?build=1427671832',
  '/media/css/wiki.css?build=1427671832',
  '/media/css/zones.css?build=1427671832',
  '/media/css/diff.css?build=1427671832',

  '/media/js/libs/prism/themes/prism.css?build=1427469741',
  '/media/js/libs/prism/plugins/line-highlight/prism-line-highlight.css?build=1427469741',
  '/media/js/libs/prism/plugins/ie8/prism-ie8.css?build=1427469741',

  '/media/js/prism-mdn/plugins/line-numbering/prism-line-numbering.css?build=1427469741',
  '/media/js/prism-mdn/components/prism-json.css?build=1427469741',

  '/media/css/wiki-syntax.css?build=1427671832',

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


// Service Worker client API - all calls are async, return a Promise
var API = {
  // Check if mdn-docs-<section-name> is already cached
  'is-cached': function(message) {
    var cacheid='mdn-docs-' + message.data.section;

    return caches.has(cacheid).then(function(cacheExists) {
      return { command: 'is-cached', result: {
        section: message.data.section,
        cached: cacheExists
      }};
    });
  },

  // Store in cache under mdn-docs-<section-name>
  'cache': function(message) {
    var cacheid='mdn-docs-' + message.data.section;

    // Open storage & save URLs
    self.caches.open(cacheid)
      // Save urls to respective caches
      .then(function(cache) {
        console.log('Adding urls to ', cache);

        return cache.addAll(message.data.urls);

      // Caching done
      }).then(function() {
        console.log('Cache populated successfully');
        return { command: 'cache', ok: {
          section: message.data.section,
          cached: true
        }};

      // Caching failed
      }).catch(function(err) {
        console.log('Failed to populate cache! Error: ' + err);
        return { command: 'is-cached', fail: {
          error: err
        }};

      });

    return Promise.resolve(message);
  }
};

// API interface
self.addEventListener('message', function(event) {
  console.log('Invoked SW API: ', event);

  // If API endpoint (command) exists, respond with the returned data
  if (API.hasOwnProperty(event.data.command)) {
    API[event.data.command].call(null, event.data).then(function(result) {
      console.log('Posting result `', result);
      event.ports[0].postMessage(result);
    });
  }
});


self.onfetch = function(event) {
  var requestURL = new URL(event.request.url);
  if (requestURL.hostname === 'developer-local.allizom.org') {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          console.log('✓Cached: ', event.request.url);
          return response;
        }

        return fetch(event.request.clone()).then(function(response) {
          console.log('Fetched: ', event.request.url);
          return response.clone();
        });
      })
    );
  }
};
