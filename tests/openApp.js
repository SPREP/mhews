/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

// These are Chimp globals
/* globals browser assert server */



describe('open the app', function () {
  beforeEach(function () {
//    server.call('generateFixtures');
  });

  it('can open the app', function () {
    browser.url('http://localhost:3000');
  });
});
