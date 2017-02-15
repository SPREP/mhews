import {Moon} from './moonutils.js';

var assert = require('assert');
describe('Moon', function() {
  describe('#getName()', function() {
    it('should be Waxing Crescent on Jan-5 2017', function() {
      assert.equal("waxing_crescent", new Moon(getDate("2017-01-05")).getName());
    });
    it('should be First Quarter on Jan-6 2017', function() {
      assert.equal("first_quarter", new Moon(getDate("2017-01-06")).getName());
    });
    it('should be Waxing Gibbous on Jan-7 2017', function() {
      assert.equal("waxing_gibbous", new Moon(getDate("2017-01-07")).getName());
    });
    it('should be Waxing Gibbous on Jan-12 2017', function() {
      assert.equal("waxing_gibbous", new Moon(getDate("2017-01-12")).getName());
    });
    it('should be Full Moon on Jan-13 2017', function() {
      assert.equal("full_moon", new Moon(getDate("2017-01-13")).getName());
    });
    it('should be Waning Gibbous on Jan-14 2017', function() {
      assert.equal("waning_gibbous", new Moon(getDate("2017-01-14")).getName());
    });
    it('should be Waning Gibbous on Jan-19 2017', function() {
      assert.equal("waning_gibbous", new Moon(getDate("2017-01-19")).getName());
    });
    it('should be Last Quarter on Jan-20 2017', function() {
      assert.equal("last_quarter", new Moon(getDate("2017-01-20")).getName());
    });
    it('should be Waning Crescent on Jan-21 2017', function() {
      assert.equal("waning_crescent", new Moon(getDate("2017-01-21")).getName());
    });
    it('should be Waning Crescent on Jan-27 2017', function() {
      assert.equal("waning_crescent", new Moon(getDate("2017-01-27")).getName());
    });
    it('should be New Moon on Jan-28 2017', function() {
      assert.equal("new_moon", new Moon(getDate("2017-01-28")).getName());
    });
    it('should be Waxing Crescent on Jan-29 2017', function() {
      assert.equal("waxing_crescent", new Moon(getDate("2017-01-29")).getName());
    });
  });
})

function getDate(str){
  return moment(str, "YYYY-MM-DD").toDate();
}
