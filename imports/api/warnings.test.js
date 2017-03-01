import Warnings from './warnings.js';
import {Earthquake} from './model/earthquake.js';
import {HeavyRain} from './model/heavyRain.js';
import {chai} from 'meteor/practicalmeteor:chai';

const quakePhenomena = {
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

const heavyRainPhenomena = {
  "bulletinId": 731,
  "type": "heavyRain",
  "level": "warning",
  "area": "Samoa",
  "direction": "Whole Area",
  "in_effect": true,
  "issued_at": "2016-12-29 22:28:30",
  "description_en": "FLOODING IS POSSIBLE FOR VULNERABLE AREAS",
  "description_ws": ""
}

describe('Warnings', function() {
  describe('#findSameWarningInEffect', function() {
    it('should return a tsunami warning for the same epicenter', function() {
      const quake = new Earthquake(quakePhenomena);
      Warnings.insert(quake);
      const quake2 = new Earthquake(_.extend(quakePhenomena, {bulletinId: 30}));
      chai.assert.equal(Warnings.findSameWarningInEffect(quake2).bulletinId, quake.bulletinId);
    });
    it('should not return a tsunami warning if the epicenter is different', function() {
      const quake = new Earthquake(quakePhenomena);
      Warnings.insert(quake);
      const quake2 = new Earthquake(_.extend(quakePhenomena, {
        bulletinId: 30,
        epicenter: {
          lat: -5.17,
          lng: 157.0
        }
      }));
      chai.assert.isUndefined(Warnings.findSameWarningInEffect(quake2));
    });
    it('should return a heavy rain warning for the same area and direction', function() {
      const heavyRain = new HeavyRain(heavyRainPhenomena);
      Warnings.insert(heavyRain);
      const heavyRain2 = new HeavyRain(_.extend(heavyRainPhenomena, {bulletinId: 30}));
      chai.assert.equal(Warnings.findSameWarningInEffect(heavyRain2).bulletinId, heavyRain.bulletinId);
    });
    it('should not return a heavy rain warning for a different area', function() {
      const heavyRain = new HeavyRain(heavyRainPhenomena);
      Warnings.insert(heavyRain);
      const heavyRain2 = new HeavyRain(_.extend(heavyRainPhenomena, {
        bulletinId: 30,
        area: "Upolu"
      }));
      chai.assert.isUndefined(Warnings.findSameWarningInEffect(heavyRain2));
    });
    it('should not return a heavy rain warning for a different direction', function() {
      const heavyRain = new HeavyRain(heavyRainPhenomena);
      Warnings.insert(heavyRain);
      const heavyRain2 = new HeavyRain(_.extend(heavyRainPhenomena, {
        bulletinId: 30,
        direction: ""
      }));
      chai.assert.isUndefined(Warnings.findSameWarningInEffect(heavyRain2));
    });

  })
});
