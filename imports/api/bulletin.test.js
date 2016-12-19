import {CycloneBulletins, removeOneIf} from './bulletin.js';
import {Warnings} from './warnings.js';

var assert = require('assert');

function getSampleBulletin(id){
  const issuedAt = new Date();
  const warnings = getSampleWarnings(issuedAt);

  return {
    "id": id,
    "issued_at": issuedAt,
    "type": "cyclone",
    "warnings": warnings,
    "tc_info": {
      "name": "Tasi"
    }
  }
}

function getSampleWarnings(issuedAt){
  const levels = ["advisory", "watch", "warning"];
  const warnings = [];
  for(let i= 0; i< 3; i++){
    warnings.push({
      "type": "heavyRain",
      "issued_at": issuedAt,
      "level": levels[i],
      "area": "Upolu Island",
      "direction": "North",
      "in_effect": true
    });
  }
  return warnings;
}

describe('CycloneBulletins', function() {
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

  if( Meteor.isServer ){

    describe('#publishBulletin', function(){
      beforeEach(function(){
        CycloneBulletins.remove({});
        Warnings.remove({});
      });

      it("should not accept a bulletin without id.", function(){
        const bulletin = getSampleBulletin(undefined);
        assert.throws(function(){ CycloneBulletins.publishBulletin(bulletin);});
      });
      it("should invalidate the effective bulletin under the same bulletin id.", function(){
        const bulletin1 = getSampleBulletin(123);
        CycloneBulletins.publishBulletin(bulletin1);
        const bulletin1Doc = CycloneBulletins.findOne({id: 123, in_effect: true}, {_id: 1});
        const bulletin2 = getSampleBulletin(123);
        CycloneBulletins.publishBulletin(bulletin2);
        CycloneBulletins.find({id: 123, in_effect: true}, {_id: 1}).forEach(function(doc){
          assert.notEqual(bulletin1Doc._id, doc._id);
        })
      });
      it("should invalidate the effective bulletin under different bulletin id.", function(){
        const bulletin1 = getSampleBulletin(123);
        CycloneBulletins.publishBulletin(bulletin1);
        const bulletin1Doc = CycloneBulletins.findOne({id: 123, in_effect: true}, {_id: 1});
        const bulletin2 = getSampleBulletin(234);
        CycloneBulletins.publishBulletin(bulletin2);
        CycloneBulletins.find(
          {in_effect: true, tc_info: {name: bulletin2.name}},
          {_id: 1}
        ).forEach(function(doc){
          assert.notEqual(bulletin1Doc._id, doc._id);
        });

      });
    });
  }
});
