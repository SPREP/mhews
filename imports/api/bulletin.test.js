import {removeOneIf} from './bulletin.js';

var assert = require('assert');
describe('GeoUtils', function() {
  describe('#removeOneIf()', function() {
    it("should return null if no match.", function(){
      const array = ["a", "b", "c", "d"];
      assert.equal(null, removeOneIf(array, (e)=>{ return e == "x"}));
      assert.equal(4, array.length);
    });
    it("should return matched element and the element is removed from the array", function(){
      const array = ["a", "b", "c", "d"];
      assert.equal("c", removeOneIf(array, (e)=>{ return e == "c"}));
      assert.equal(3, array.length);
      assert.equal(false, array.includes("c"));
    });
  });
});
