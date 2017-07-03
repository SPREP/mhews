// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by fixtures.js.
import { name as packageName } from "meteor/fixtures";

// Write your tests here!
// Here is an example.
Tinytest.add('fixtures - example', function (test) {
  test.equal(packageName, "fixtures");
});
