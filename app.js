'use strict';

// cPanel/CloudLinux Passenger loads a CommonJS startup file. The application
// itself remains in an ES module so local Node and Passenger use the same server.
if (typeof globalThis.PhusionPassenger !== 'undefined') {
  globalThis.PhusionPassenger.configure({ autoInstall: false });
}

void import('./server.mjs').catch((error) => {
  console.error('Nile Stock failed to start:', error);
  process.exitCode = 1;
});
