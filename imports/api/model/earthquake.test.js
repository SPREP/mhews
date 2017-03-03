import {chai} from 'meteor/practicalmeteor:chai';
import {Earthquake} from './earthquake.js';
import {sinon} from 'meteor/practicalmeteor:sinon';

const _ = require("lodash");

const phenomena = {
  "type": "tsunami",
  "bulletinId": 29,
  "issued_at": "2016-12-08 11:55:00",
  "in_effect": true,
  "level": "warning",
  "epicenter": {
    "lat": -4.173686,
    "lng": 155.895308
  },
  "date_time": "2016-12-08 11:45:00",
  "direction_en": "South West",
  "direction_ws": "Saute Sisifo",
  "mw": 8.0,
  "depth": 10,
  "region": "PNG",
  "distance_km": 12345.6789,
  "distance_miles": 7200.12345,
  "description_en": "System test, please ignore.",
  "description_ws": "System test, please ignore."
}

describe('earthquake', function() {

  describe('#isSameEvent', function() {
    it('should return true if two earthquakes happened at exactly same location and time.', sinon.test(function() {
      const quake1 = new Earthquake(phenomena);
      const quake2 = new Earthquake(phenomena);
      chai.assert.isTrue(quake1.isSameEvent(quake2));
    }))

    it('should return false if two earthquakes happened at different time.', sinon.test(function() {
      const quake1 = new Earthquake(phenomena);
      const quake2 = new Earthquake(_.create(phenomena, {
        date_time: moment(phenomena.date_time).add(2, "minutes").format("YYYY-MM-DD hh:mm:ss")
      }));
      chai.assert.isFalse(quake1.isSameEvent(quake2));
    }))

    it('should return false if two earthquakes happened at different location.', sinon.test(function() {
      const quake1 = new Earthquake(phenomena);
      const quake2 = new Earthquake(_.create(phenomena, {
        epicenter: {
          lat: phenomena.epicenter.lat + 1,
          lng: phenomena.epicenter.lng
        }
      }));
      chai.assert.isFalse(quake1.isSameEvent(quake2));
    }))
  });

  describe('#toPushMessage', function() {
    it('should return the push message including earthquake phenomena.', sinon.test(function() {
      const quake = new Earthquake(phenomena);
      const message = quake.toPushMessage();
      chai.assert.equal(message.data.epicenter_lat, quake.epicenter.lat);
      chai.assert.equal(message.data.epicenter_lng, quake.epicenter.lng);
      chai.assert.isTrue(message.notification.body.indexOf(quake.region) >= 0);
      chai.assert.isTrue(message.notification.body.indexOf(quake.mw) >= 0);
    }))
  });

});
