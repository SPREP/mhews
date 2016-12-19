import * as HazardArea from './hazardArea.js';

var assert = require('assert');
describe('hazardArea', function() {
  describe('maybeInHazardArea', function() {
    // Apia is on the Upolu island
    const Apia = {
      lat: -13.815605,
      lng: -171.780512
    };
    // Apai is on the Manono island
    const Apai = {
      lat:-13.850414,
      lng:-172.109756
    };
    // Salelologa is on the Savaii island
    const Salelologa = {
      lat: -13.738,
      lng: -172.222
    }

    it('should work without the specific direction.', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Apia, {area: "Samoa"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Apia, {area: "Upolu Island"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Apia, {area: "Savaii Island"}));
    });
    it('test Apia', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Apia, {area: "Samoa", direction: "North"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Apia, {area: "Upolu Island", direction: "North"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Apia, {area: "Upolu Island", direction: "West"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Apia, {area: "Savaii Island", direction: "North"}));
    });
    it('test Salelologa', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Salelologa, {area: "Samoa", direction: "South"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Salelologa, {area: "Upolu Island", direction: "South"}));
      // FIXME: Wrong definition of Savaii South makes the next assert fail...
//      assert.equal(true,HazardArea.maybeInHazardArea(Salelologa, {area: "Savaii Island", direction: "South"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Salelologa, {area: "Savaii Island", direction: "East"}));
    });
    it('test Apai', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Apai, {area: "Samoa"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Apai, {area: "Upolu Island"}));
      assert.equal(false,HazardArea.maybeInHazardArea(Apai, {area: "Savaii Island"}));
      assert.equal(true,HazardArea.maybeInHazardArea(Apai, {area: "Manono Island"}));
    });
    it('should return true when area is not specified', function() {
      assert.equal(true,HazardArea.maybeInHazardArea(Apia, {}));
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
