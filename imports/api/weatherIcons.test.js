import {chai} from 'meteor/practicalmeteor:chai';
import {selectPredominantWeatherSymbol} from './weatherIcons.js';

describe('weatherIcons', function() {
  describe('#selectPredominantWeatherSymbol', function() {
    it('should return sunny when it is sunny for the whole day.', function() {
      chai.assert.equal("clear", selectPredominantWeatherSymbol(["clear","clear","clear","clear"]))
    });
    it('should return sunny when it is sunny for the day time and rain during night time.', function() {
      chai.assert.equal("clear", selectPredominantWeatherSymbol(["moderate","clear","clear","moderate"]))
    });
    it('should return rainy when it is sunny in the morning and rainy in the afternoon.', function() {
      chai.assert.equal("moderate", selectPredominantWeatherSymbol(["clear","clear","moderate","clear"]))
    });
    it('should return rainy when it is rainy in the morning and sunny in the afternoon.', function() {
      chai.assert.equal("moderate", selectPredominantWeatherSymbol(["clear","moderate","clear","clear"]))
    });
    it('should return rainy when it is showerly in the morning and rainy in the afternoon.', function() {
      chai.assert.equal("moderate", selectPredominantWeatherSymbol(["clear","shower","moderate","clear"]))
    });
  })
});
