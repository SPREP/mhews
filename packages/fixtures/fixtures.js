// Write your package code here!

import {TideTableCollection} from '/imports/api/tidetable.js';

// Variables exported by this module can be imported by other packages and
// applications. See fixtures-tests.js for an example of importing.
export const name = 'fixtures';

function generateFixtures(){
  TideTableCollection.remove({}, {multi: 1});
}

Meteor.methods({
  generateFixtures: generateFixtures
})
