import {chai} from 'meteor/practicalmeteor:chai';
import {Warning} from './warning.js';
import {sinon} from 'meteor/practicalmeteor:sinon';

const _ = require("lodash");

const phenomena = {
  "bulletinId": 735,
  "type": "wind",
  "level": "advisory",
  "area": "Samoa",
  "direction": "Highland",
  "in_effect": true,
  "issued_at": "2017-02-10 10:06:30",
  "description_en": "Free text in English",
  "description_ws": "Free text in Samoan"
};

describe('warning', function() {

  describe('#isMoreSignificant', function() {
    it('should return that advisory is more significant than information', sinon.test(function() {
      const advisory = new Warning(phenomena);
      const info = new Warning(_.create(phenomena, {level: "information"}));
      chai.assert.isTrue(advisory.isMoreSignificant(info));
      chai.assert.isFalse(info.isMoreSignificant(advisory));
    }))

    it('should return that watch is more significant than advisory', sinon.test(function() {
      const advisory = new Warning(phenomena);
      const watch = new Warning(_.create(phenomena, {level: "watch"}));
      chai.assert.isTrue(watch.isMoreSignificant(advisory));
      chai.assert.isFalse(advisory.isMoreSignificant(watch));
    }))

    it('should return that warning is more significant than watch', sinon.test(function() {
      const watch = new Warning(_.create(phenomena, {level: "watch"}));
      const warning = new Warning(_.create(phenomena, {level: "warning"}));
      chai.assert.isTrue(warning.isMoreSignificant(watch));
      chai.assert.isFalse(watch.isMoreSignificant(warning));
    }))
  });

  describe('#isForSameArea', function() {
    it('should return true if the area and direction of two warnings are the same.', sinon.test(function() {
      const warning1 = new Warning(phenomena);
      const warning2 = new Warning(phenomena);
      chai.assert.isTrue(warning1.isForSameArea(warning2));
    }))
    it('should return true if the area of two warnings are the same and direction are not specified.', sinon.test(function() {
      const warning1 = new Warning(_.omit(phenomena, "direction"));
      const warning2 = new Warning(_.omit(phenomena, "direction"));
      chai.assert.isTrue(warning1.isForSameArea(warning2));
    }))
    it('should return false if the area of two warnings are different.', sinon.test(function() {
      const warning1 = new Warning(phenomena);
      const warning2 = new Warning(_.create(phenomena, {area: "Upolu"}));
      chai.assert.isFalse(warning1.isForSameArea(warning2));
    }))
    it('should return false if the direction of two warnings are different.', sinon.test(function() {
      const warning1 = new Warning(phenomena);
      const warning2 = new Warning(_.create(phenomena, {direction: "North"}));
      chai.assert.isFalse(warning1.isForSameArea(warning2));
    }))
  });

  describe('#changeNeedsAttention', function() {
    it('should return true if watch or warning for this area and direction is newly in effect', sinon.test(function() {
      const info = new Warning(_.create(phenomena, {level: "information"}));
      const advisory = new Warning(phenomena);
      const watch = new Warning(_.create(phenomena, {level: "watch"}));
      const warning = new Warning(_.create(phenomena, {level: "warning"}));
      chai.assert.isFalse(info.changeNeedsAttention());
      chai.assert.isFalse(advisory.changeNeedsAttention());
      chai.assert.isTrue(watch.changeNeedsAttention());
      chai.assert.isTrue(warning.changeNeedsAttention());
    }))
    it('should return true if the same warning remains in effect but the level has been raised.', sinon.test(function() {
      const watch = new Warning(_.create(phenomena, {level: "watch"}));
      const warning = new Warning(_.create(phenomena, {level: "warning"}));
      chai.assert.isTrue(warning.changeNeedsAttention(watch));
      chai.assert.isFalse(watch.changeNeedsAttention(warning));
    }))
  });

  describe('#toPushMessage', function() {
    it('should contain the mandatory fields.', sinon.test(function() {
      const watch = new Warning(_.create(phenomena, {level: "watch"}));
      const message = watch.toPushMessage();
      chai.assert.equal(message.priority, "high");
      chai.assert.isTrue(message.notification.title.indexOf(watch.type) >= 0);
      chai.assert.isTrue(message.notification.title.indexOf(watch.level) >= 0);
      chai.assert.equal(message.data.type, watch.type);
      chai.assert.equal(message.data.level, watch.level);
      chai.assert.equal(message.data.bulletinId, watch.bulletinId);
      chai.assert.isTrue(message.data.in_effect);
      chai.assert.isFalse(message.data.is_exercise);
      chai.assert.equal(message.data.issued_at, watch.issued_at);
      chai.assert.equal(message.data.description_en, watch.description_en);
      chai.assert.equal(message.data.description_ws, watch.description_ws);
    }))

    it('should contain "Cancel" in the title if in_effect is false.', sinon.test(function() {
      const warning = new Warning(_.create(phenomena, {level: "warning", in_effect: false}));
      const message = warning.toPushMessage();
      chai.assert.isTrue(message.notification.title.indexOf("Cancel") >= 0);
      chai.assert.isFalse(message.data.in_effect);
    }))

    it('should contain "EXERCISE" in the title if is_exercise is true.', sinon.test(function() {
      const warning = new Warning(_.create(phenomena, {level: "warning", is_exercise: true}));
      const message = warning.toPushMessage();
      chai.assert.isTrue(message.notification.title.indexOf("EXERCISE") >= 0);
      chai.assert.isTrue(message.data.is_exercise);
    }))

    it('should contain "EXERCISE" and "Cancel" in the title if in_effect is false and is_exercise is true.', sinon.test(function() {
      const warning = new Warning(_.create(phenomena, {level: "warning", in_effect: false, is_exercise: true}));
      const message = warning.toPushMessage();
      chai.assert.isTrue(message.notification.title.indexOf("Cancel") >= 0);
      chai.assert.isTrue(message.notification.title.indexOf("EXERCISE") >= 0);
      chai.assert.isFalse(message.data.in_effect);
      chai.assert.isTrue(message.data.is_exercise);
    }))

  });

});
