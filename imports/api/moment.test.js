var assert = require('assert');
import moment from 'moment';

// Daylight saving time reference:
// https://www.timeanddate.com/time/zone/samoa/apia
describe('Momentjs', function() {
  describe('#isDST()', function() {
    it('should be daylight saving time on Apr-1 2017', function() {
      assert.equal(true, moment("2017-04-01").isDST());
    });
    it('should not be daylight saving time on Apr-2 2017', function() {
      assert.equal(false, moment("2017-04-02 06:00").isDST());
    });
    it('should not be daylight saving time on Sep-23 2017', function() {
      assert.equal(false, moment("2017-09-23").isDST());
    });
    it('should be daylight saving time on Sep-24 2017', function() {
      assert.equal(true, moment("2017-09-24 06:00").isDST());
    });
    it('should be daylight saving time on Mar-31 2018', function() {
      assert.equal(true, moment("2018-03-31").isDST());
    });
    it('should not be daylight saving time on Apr-1 2018', function() {
      assert.equal(false, moment("2018-04-01 06:00").isDST());
    });
    it('should not be daylight saving time on Sep-29 2018', function() {
      assert.equal(false, moment("2018-09-29").isDST());
    });
    it('should be daylight saving time on Sep-30 2018', function() {
      assert.equal(true, moment("2018-09-30 06:00").isDST());
    });
    it('should be daylight saving time on Apr-6 2019', function() {
      assert.equal(true, moment("2019-04-06").isDST());
    });
    it('should not be daylight saving time on Apr-7 2019', function() {
      assert.equal(false, moment("2019-04-07 06:00").isDST());
    });
    it('should not be daylight saving time on Sep-28 2019', function() {
      assert.equal(false, moment("2019-09-28").isDST());
    });
    it('should be daylight saving time on Sep-29 2019', function() {
      assert.equal(true, moment("2019-09-29 06:00").isDST());
    });
    it('should be daylight saving time on Apr-4 2020', function() {
      assert.equal(true, moment("2020-04-04").isDST());
    });
    it('should not be daylight saving time on Apr-5 2020', function() {
      assert.equal(false, moment("2020-04-05 06:00").isDST());
    });
    it('should not be daylight saving time on Sep-26 2020', function() {
      assert.equal(false, moment("2020-09-26").isDST());
    });
    it('should be daylight saving time on Sep-27 2020', function() {
      assert.equal(true, moment("2020-09-27 06:00").isDST());
    });
  })
});
