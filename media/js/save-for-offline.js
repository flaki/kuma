/* jshint unused: false */

// Progressively enhance with offline functionality when Service Workers are available
('serviceWorker' in navigator)&&(function() {
  'use strict';

  // Check if ServiceWorker is active already
  var activeSW = navigator.serviceWorker.controller;


  // This should come from an API based on the current page
  var sectionName = "demo";
  var sectionURLs = [
    '/en-US/docs/Web/Reference/API',
    '/en-US/docs/DOM',
    '/en-US/docs/DOM/DOM_Reference/Introduction',
    '/en-US/docs/WebAPI/Using_Light_Events'
  ];

  // Messaging helper
  // via https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/post-message
  function messageServiceWorker(message) {
    return new Promise(function(resolve, reject) {
      var messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    });
  }

  // Installs the service-worker on-demand
  function installServiceWorker() {
    console.log('Installing Service Worker...');

    navigator.serviceWorker.register('/media/js/main.sw.js',{
      scope: '/'
    }).then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }


  // Check if specified section has been cached
  function isSectionCached(section) {
    return messageServiceWorker({
      command: 'is-cached',
      data: {
        section: section
      }
    });
  }

  // Save current section into offline cache (async, returns a Promise)
  function cacheSection(section, urls) {
    return messageServiceWorker({
      command: 'cache',
      data: {
        section: section,
        urls: urls
      }
    });
  }


  // Adds SW cache button to the page
  console.log('Adding service worker button...');
  var buttonOverlay = document.createElement('div');
    buttonOverlay.id='save-offline-btn';
    buttonOverlay.style.position = 'fixed';
    buttonOverlay.style.right = 0;
    buttonOverlay.style.bottom = 0;
    buttonOverlay.style.zIndex = 1000;

  // Service Worker active!
  if (activeSW) {
    buttonOverlay.innerHTML = '<button style="background-color: green; color: white; margin: 1em; padding: 1em; font-size: 1.2em;">SAVE FOR OFFLINE</button>';

    // Check with the Service Worker if current section has already been cached
    isSectionCached(sectionName).then(function(response) {
      if (response.result.cached) {
        buttonOverlay.innerHTML = '<button disabled style="background-color: orange; color: white; margin: 1em; padding: 1em; font-size: 1.2em;">CACHED OFFLINE</button>';
      }

      // Adds cache button to the page
      document.body.appendChild(buttonOverlay);

      // Caches current page if clicked
      if (!response.result.cached) {
        console.log('Adding service worker button event listener...');
        document.querySelector('#save-offline-btn').addEventListener('click', function() {
          cacheSection(sectionName, sectionURLs).then(function(result) {
            console.log('Successfully saved ', sectionName, ' for offline access!', result);

          }).catch(function(error) {
            console.log('Failed to cache current section: ', error);
          });
        });
      }
    });

  } else {
    // TODO: show a "Service Worker installed -- reload page to activate & cache pages offline" button
    console.log('Please reload page to access MDN Offline features.');
  }

  // Install Service Worker
  installServiceWorker();
})();
