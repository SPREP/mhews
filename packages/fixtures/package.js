Package.describe({
  name: 'fixtures',
  version: '0.0.1',
  // Set debugOnly true so that this is not included in the production code.
  debugOnly: true,
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2.3');
  api.use('ecmascript');
  api.mainModule('fixtures.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('fixtures');
  api.mainModule('fixtures-tests.js');
});
