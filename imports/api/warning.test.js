var assert = require('assert');
import {Warnings} from "./warnings.js";
import { check } from 'meteor/check'

function getValidWarning(bulletinId){
  return {
    "bulletinId": bulletinId ? bulletinId : 1,
    "type": "tsunami",
    "issued_at": "2016-12-08 11:55:00",
    "in_effect": true,
    "level": "warning",
    "epicenter": {
      "lat": -13.814213,
      "lng": -171.779657
    },
    "mw": 8.0,
    "depth": 10,
    "description": "Escape immediately!"
  }
};

describe('Warnings', function() {
  if( Meteor.isServer ){

    describe('upsert()', function() {
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
        assert.throws(function(){Warnings.insert(warning)}, Match.Error);
      });
      it('insert a warning without type should fail', function() {
        const warning = getValidWarning();
        warning.type = undefined;
        assert.throws(function(){Warnings.insert(warning)});
      });
      it('insert a warning without issued_at should fail', function() {
        const warning = getValidWarning();
        warning.issued_at = undefined;
        assert.throws(function(){Warnings.insert(warning)});
      });
      it('insert a warning with the same bulletinId should update the existing one.', function() {
        const warning = getValidWarning(900);
        Warnings.insert(warning);
        const anotherWarning = getValidWarning(900);
        Warnings.insert(anotherWarning);
        const foundWarning = Warnings.find({type: "tsunami", bulletinId: 900}).fetch();
        assert.equal(foundWarning.length, 1);
      });
    });
  }

  if( Meteor.isServer ){
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
        const result = Warnings.findWarningsInEffect("tsunami");
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
        const result = Warnings.findWarningsInEffect("tsunami");
        assert.equal(2, result.length);
        result.forEach(function(w){
          assert.equal(true, w.in_effect);
        });
      });
    });

  }

  if( Meteor.isServer ){
    describe('cancelWarning()', function() {
      beforeEach(function(){
        Warnings.remove({});
      });

      it('cancel a warning that is not in effect.', function() {
        const warning = getValidWarning(100);
        warning.in_effect = false;
        Warnings.insert(warning);
        Warnings.cancelWarning(warning);
        assert.equal(false, Warnings.findOne({type: "tsunami", bulletinId: 100}).in_effect);
      });
      it('cancel a warning', function() {
        const warning = getValidWarning(100);
        Warnings.insert(warning);
        Warnings.cancelWarning(warning);
        assert.equal(false, Warnings.findOne({type: "tsunami", bulletinId: 100}).in_effect);
      });
    });
  }
});
