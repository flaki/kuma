// Progressively enhance with offline functionality when Service Workers are available
('serviceWorker' in navigator)&&(function() {
  'use strict';

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

  // Save current section into offline cache
  function cacheSection() {

  }


  // Check if ServiceWorker is active already
  var isSWActive = !!(navigator.serviceWorker.controller);


  // Adds SW cache button to the page
  console.log('Adding service worker button...');
  var buttonOverlay = document.createElement('div');
    buttonOverlay.id='save-offline-btn';
    buttonOverlay.style.position = 'fixed';
    buttonOverlay.style.right = 0;
    buttonOverlay.style.bottom = 0;
    buttonOverlay.style.zIndex = 1000;

    if (isSWActive) {
      buttonOverlay.innerHTML = '<button disabled style="background-color: orange; color: white; margin: 1em; padding: 1em; font-size: 1.2em;">CACHED OFFLINE</button>';
    } else {
      buttonOverlay.innerHTML = '<button style="background-color: green; color: white; margin: 1em; padding: 1em; font-size: 1.2em;">SAVE FOR OFFLINE</button>';
    }
  document.body.appendChild(buttonOverlay);


  // Caches current page if clicked
  console.log('Adding service worker button event listener...');
  document.querySelector('#save-offline-btn').addEventListener('click', cacheSection);

  // Install Service Worker
  installServiceWorker()
})();
