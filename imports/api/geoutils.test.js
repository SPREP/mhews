import * as GeoUtils from './geoutils.js';

var assert = require('assert');
describe('GeoUtils', function() {
  describe('#getZoomLevel()', function() {
    it('should zoom level 6 for 2100km', function() {
      assert.equal(6, GeoUtils.getZoomLevel(2100));
    });
    it('should zoom level 6 for 2000km', function() {
      assert.equal(6, GeoUtils.getZoomLevel(2000));
    });
    it('should zoom level 6 for 1100km', function() {
      assert.equal(6, GeoUtils.getZoomLevel(1100));
    });
    it('should zoom level 7 for 1000km', function() {
      assert.equal(7, GeoUtils.getZoomLevel(1000));
    });
    it('should zoom level 8 for 500km', function() {
      assert.equal(8, GeoUtils.getZoomLevel(500));
    });
    it('should zoom level 9 for 200km', function() {
      assert.equal(9, GeoUtils.getZoomLevel(200));
    });
    it('should zoom level 10 for 100km', function() {
      assert.equal(10, GeoUtils.getZoomLevel(100));
    });
    it('should zoom level 10 for 50km', function() {
      assert.equal(10, GeoUtils.getZoomLevel(50));
    });
    it('should zoom level 10 for 20km', function() {
      assert.equal(10, GeoUtils.getZoomLevel(20));
    });
    it('should zoom level 10 for 10km', function() {
      assert.equal(10, GeoUtils.getZoomLevel(10));
    });
  });
});
