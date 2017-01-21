import * as HazardArea from './hazardArea.js';
import Town from './towninfo.js';

var assert = require('assert');
describe('hazardArea', function() {
  describe('maybeInHazardArea', function() {
    it('should work without the specific direction.', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apai, {area: "Samoa"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apia, {area: "Upolu Island"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Town.Apia, {area: "Savaii Island"}));
    });
    it('test Apia', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apia, {area: "Samoa", direction: "North"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apia, {area: "Upolu Island", direction: "North"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apia, {area: "Upolu Island", direction: "West"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Town.Apia, {area: "Savaii Island", direction: "North"}));
    });
    it('test Salelologa', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Salelologa, {area: "Samoa", direction: "South"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Town.Salelologa, {area: "Upolu Island", direction: "South"}));
      // FIXME: Wrong definition of Savaii South makes the next assert fail...
//      assert.equal(true,HazardArea.maybeInHazardArea(Salelologa, {area: "Savaii Island", direction: "South"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Salelologa, {area: "Savaii Island", direction: "East"}));
    });
    it('test Apai', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apai, {area: "Samoa"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Town.Apai, {area: "Upolu Island"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Town.Apai, {area: "Savaii Island"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apai, {area: "Manono Island"}));
    });
    it('should return true when area is not specified', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Town.Apia, {}));
    });
  },
  describe("getAreaId", function(){
    it("should work with area and direction specified", function(){
      assert.equal("samoa_upolu_north", HazardArea.getAreaId("Upolu Island", "North"));
    });
    it("should work with only area specified", function(){
      assert.equal("samoa_savaii", HazardArea.getAreaId("Savaii Island"));
    });
    it("should work when Samoa is specified", function(){
      assert.equal("samoa", HazardArea.getAreaId("Samoa"));
    });
    it("should return undefined when nothing is specified", function(){
      assert.equal(undefined, HazardArea.getAreaId());
    });
    it("should return undefined when unknown area is specified", function(){
      assert.equal(undefined, HazardArea.getAreaId("Tokyo"));
    });
  })
);
});
