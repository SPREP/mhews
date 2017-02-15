var assert = require('assert');
import Warnings from "./warnings.js";

function getValidWarning(bulletinId){
  return {
    "bulletinId": bulletinId ? bulletinId : 1,
    "type": "tsunami",
    "issued_at": moment("2016-12-08 11:55:00").toDate(),
    "in_effect": true,
    "level": "warning",
    "date_time": moment("2016-12-08 11:55:00").toDate(),
    "epicenter": {
      "lat": -13.814213,
      "lng": -171.779657
    },
    "mw": 8.0,
    "depth": 10,
    "description_en": "Escape immediately!",
    "description_ws": "Escape immediately!"
  }
}

describe('Warnings', function() {
  describe('publishWarning()', function() {
    beforeEach(function(){
      Warnings.remove({});
    });
    it('insert a valid warning', function() {
      Warnings.insert(getValidWarning(831));
      const foundWarning = Warnings.findOne({type: "tsunami", bulletinId: 831});
      console.log(JSON.stringify(foundWarning));
      assert.equal(foundWarning.bulletinId, 831);
      assert.equal(foundWarning.type, "tsunami");
      assert.equal(foundWarning.depth, 10);
    });
    it('insert a warning without bulletinId should fail', function() {
      const warning = getValidWarning();
      warning.bulletinId = undefined;
      assert.throws(function(){Warnings.publishWarning(warning)}, Match.Error);
    });
    it('insert a warning without type should fail', function() {
      const warning = getValidWarning();
      warning.type = undefined;
      assert.throws(function(){Warnings.publishWarning(warning)});
    });
    it('insert a warning without issued_at should fail', function() {
      const warning = getValidWarning();
      warning.issued_at = undefined;
      assert.throws(function(){Warnings.publishWarning(warning)});
    });
    it('insert a warning with the same bulletinId should update the existing one.', function() {
      const warning = getValidWarning(900);
      Warnings.publishWarning(warning);
      const anotherWarning = getValidWarning(900);
      Warnings.publishWarning(anotherWarning);
      const foundWarning = Warnings.find({type: "tsunami", bulletinId: 900}).fetch();
      assert.equal(foundWarning.length, 1);
    });
  });

  describe('findWarningsInEffect()', function() {
    beforeEach(function(){
      Warnings.remove({});
    });

    it('find a single warning in effect.', function() {
      const warning = getValidWarning(100);
      Warnings.insert(warning);
      const anotherWarning = getValidWarning(101);
      anotherWarning.in_effect = false;
      Warnings.insert(anotherWarning);
      const result = Warnings.findWarningsInEffect("tsunami").fetch();
      assert.equal(1, result.length);
      result.forEach(function(w){
        assert.equal(true, w.in_effect);
      });
    });
    it('find mulitple warnings in effect.', function() {
      const warning = getValidWarning(100);
      Warnings.insert(warning);
      const anotherWarning = getValidWarning(101);
      Warnings.insert(anotherWarning);
      const result = Warnings.findWarningsInEffect("tsunami").fetch();
      assert.equal(2, result.length);
      result.forEach(function(w){
        assert.equal(true, w.in_effect);
      });
    });
  });

  describe('cancelWarning()', function() {
    beforeEach(function(){
      Warnings.remove({});
    });

    it('cancel a warning that is not in effect.', function() {
      const warning = getValidWarning(100);
      warning.in_effect = false;
      Warnings.insert(warning);
      Warnings.cancelWarning(warning.type, warning.bulletinId);
      assert.equal(false, Warnings.findOne({type: "tsunami", bulletinId: 100}).in_effect);
    });
    it('cancel a warning', function() {
      const warning = getValidWarning(100);
      Warnings.insert(warning);
      Warnings.cancelWarning(warning.type, warning.bulletinId);
      assert.equal(false, Warnings.findOne({type: "tsunami", bulletinId: 100}).in_effect);
    });
  });

});
