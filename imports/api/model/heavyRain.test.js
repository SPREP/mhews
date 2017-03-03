import {chai} from 'meteor/practicalmeteor:chai';
import {HeavyRain} from './heavyRain.js';
import {sinon} from 'meteor/practicalmeteor:sinon';

const phenomena = {
  "bulletinId": 731,
  "type": "heavyRain",
  "level": "warning",
  "area": "Savaii Island",
  "direction": "South",
  "in_effect": true,
  "issued_at": "2016-12-08 10:06:30",
  "description_en": "SYSTEM TEST PLEASE IGNORE.",
  "description_ws": ""
}

describe('heavyRain', function() {

  describe('#isSameEvent', function() {
    it('should return true if the area and direction are the same', sinon.test(function() {
      const warning1 = new HeavyRain(phenomena);
      const warning2 = new HeavyRain(phenomena);
      chai.assert.isTrue(warning1.isSameEvent(warning2));
    }))

    it('should return false if the area is different', sinon.test(function() {
      const warning1 = new HeavyRain(phenomena);
      const warning2 = new HeavyRain(_.extend(_.clone(phenomena), {
        area: "Upolu Island"
      }));
      chai.assert.isFalse(warning1.isSameEvent(warning2));
    }))

    it('should return false if the direction is different', sinon.test(function() {
      const warning1 = new HeavyRain(phenomena);
      const warning2 = new HeavyRain(_.extend(_.clone(phenomena), {
        direction: "North"
      }));
      chai.assert.isFalse(warning1.isSameEvent(warning2));
    }))
  });

  describe('#toPushMessage', function() {
    it('should return the push message including heavy rain phenomena.', sinon.test(function() {
      const warning = new HeavyRain(phenomena);
      const message = warning.toPushMessage();
      chai.assert.isTrue(message.notification.body.indexOf(warning.area) >= 0);
      chai.assert.isTrue(message.notification.body.indexOf(warning.direction) >= 0);
      chai.assert.equal(message.data.area, warning.area);
      chai.assert.equal(message.data.direction, warning.direction);
    }))
  });

});
