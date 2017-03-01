import {toTitleCase} from './strutils.js';
import {chai} from 'meteor/practicalmeteor:chai';

describe('strutils', function() {
  describe('#toTitleCase', function() {
    it('should return capital letter at the beginning of a sentence', function() {
      chai.assert.equal("This is a pen.", toTitleCase("this is a pen."));
    });
    it('should not change capital letters in the original sentence to lower case.', function() {
      chai.assert.equal("This is a PEN.", toTitleCase("this is a PEN."));
    });
  })
});
